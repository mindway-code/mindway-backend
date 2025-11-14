// src/supabase/middlewares/authSupabase.js
import jwt from 'jsonwebtoken';
import authConfig from '../config/auth.js'; // ajuste o path se necessário


export default async function authTherapistSupabase(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido. Supabase' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Token malformado.' });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token malformado.' });
    }

    jwt.verify(token, authConfig.secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: 'Token inválido. Supabase' });
      }

      req.userIdSupabase = decoded.id;
      req.profileIdSupabase = decoded.profile_id;

      if(req.profileIdSupabase === 2 || req.profileIdSupabase === 3) {
        return next();
      }
      else {
        return res.status(403).json({ error: 'Acesso negado. Você não tem permissão para acessar esta rota.' });
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Erro interno no middleware de autenticação.',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}

