// src/supabase/controllers/SessionSupabase.js
import jwt from 'jsonwebtoken';
import * as Yup from 'yup';
import authConfig from '../../../config/auth';
import bcrypt from 'bcryptjs';
import { supabase } from '../../../database/indexSupabase.js';

class SessionSupabaseController {

  async store(req, res) {

    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Falha na validação' });
    }

    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, surname, email, profile_id, password_hash')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Erro ao buscar usuário', details: error.message });
    }

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const { id, name, surname, profile_id } = user;

    const session_status = 'success';
    const delay = req.delay || 0;

    const { error: sessionError } = await supabase
      .from('sessions')
      .insert([{
        session_status: session_status,
        delay: delay,
        user_id: id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);

    if (sessionError) {
      console.error('Erro ao registrar sessão:', sessionError);
    }

    const token = jwt.sign({ id, profile_id }, authConfig.secret, {
      expiresIn: authConfig.expiresIn,
    });

    return res.json({
      user: { id, name, surname, email, profile_id },
      token,
    });
  }

  async validateSession(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const [, token] = authHeader.split(' ');

    try {
      const decoded = jwt.verify(token, authConfig.secret);

      req.userId = decoded.id;
      req.profileId = decoded.profile_id;

      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  }

  async logout(req, res) {
    try {

      const userId = req.userId;

      const { error: updateError } = await supabase
        .from('sessions')
        .update({ session_status: 'offline', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('session_status', 'success');

      if (updateError) {
        console.error('Erro ao atualizar sessão:', updateError);
        return res.status(500).json({ error: 'Erro ao atualizar status da sessão.' });
      }

      return res.json({ message: 'Logout realizado com sucesso. Remova o token no cliente.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
  }
}

export default new SessionSupabaseController();
