// src/controllers/UserSupabase.js
import * as Yup from 'yup';
import { supabase } from '../../../database/indexSupabase';
import bcrypt from 'bcryptjs';

class UserSupabaseController {
  async index(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { name } = req.query;

      let query = supabase
        .from('users')
        .select(`
          id, name, surname, email,
          profile:profiles(id, name),
          contact:contacts(id, telephone, smartphone),
          address:addresses(address_name, country, state, city, cep)
        `, { count: 'exact', head: false })
        .range(from, to);


      if (name) {
        query = query.ilike('name', `%${name}%`);
      }

      const { data: users, count, error } = await query;

      if (error) {
        return res.status(500).json({ error: 'Erro ao buscar usuários.', details: error.message });
      }

      return res.json({
        totalPages: Math.ceil(count / pageSize),
        currentPage: page,
        pageSize: pageSize,
        totalUsers: count,
        users,
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao buscar usuários.',
        details: error.message
      });
    }
  }


  async store(req, res) {
    try {

      const schema = Yup.object().shape({
        name: Yup.string().required(),
        surname: Yup.string().required(),
        email: Yup.string().email().required(),
        password: Yup.string().required().min(6),
        confirmPassword: Yup.string()
          .required()
          .oneOf([Yup.ref('password')], 'As senhas não coincidem'),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validação falhou 2' });
      }

      const { data: userExists, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('email', req.body.email)
        .maybeSingle();
      if (findError) {
        throw findError;
      }
      if (userExists) {
        return res.status(400).json({ error: 'Usuário já existe' });
      }

      const { name, surname, email, password } = req.body;

      const password_hash = await bcrypt.hash(password, 8);

      const { data: created, error: createError } = await supabase
        .from('users')
        .insert([{
          name,
          surname,
          email,
          password_hash,
          profile_id: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .maybeSingle();

      if (createError || !created) {
        return res.status(500).json({ error: 'Erro ao criar usuário.', details: createError?.message });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name')
        .eq('id', created.profile_id)
        .maybeSingle();

      const { data: address } = created.address_id
        ? await supabase.from('addresses').select('id, address_name, country, state, city, cep').eq('id', created.address_id).maybeSingle()
        : { data: null };

      const { data: contact } = created.contact_id
        ? await supabase.from('contacts').select('id, telephone, smartphone').eq('id', created.contact_id).maybeSingle()
        : { data: null };

      return res.json({
        id: created.id,
        name: created.name,
        surname: created.surname,
        email: created.email,
        profile,
        address,
        contact,
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao criar usuário.', details: error.message });
    }
  }


  async updateData(req, res) {
    const {
      name, surname, email, oldPassword,
      password, confirmPassword, contact,
      address, profile
    } = req.body;

    const userId = req.userIdSupabase;

    try {
      // Busca usuário atual
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, name, surname, email, password_hash, profile_id, contact_id, address_id')
        .eq('id', userId)
        .maybeSingle();

      if (userError) throw userError;

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }

      // Checa se email está sendo alterado e se já existe
      if (email && email !== user.email) {
        const { data: emailExists } = await supabase
          .from('users')
          .select('id')
          .eq('email', email)
          .neq('id', userId)
          .maybeSingle();

        if (emailExists) {
          return res.status(400).json({ error: 'Email já cadastrado' });
        }
      }

      // Validação da senha (igual ao seu local)
      if (oldPassword) {
        if (!password) {
          return res.status(400).json({ error: 'Nova senha é obrigatória quando a senha antiga é informada' });
        }
        if (password.length < 6) {
          return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres' });
        }
        if (!confirmPassword) {
          return res.status(400).json({ error: 'Confirmação de senha é obrigatória' });
        }
        if (password !== confirmPassword) {
          return res.status(400).json({ error: 'A confirmação da senha não confere' });
        }
        const passwordOk = await bcrypt.compare(oldPassword, user.password_hash);
        if (!passwordOk) {
          return res.status(401).json({ error: 'Senha antiga incorreta' });
        }
      }

      // Monta os dados a atualizar
      const updates = {
        ...(name && { name }),
        ...(surname && { surname }),
        ...(email && { email }),
        ...(oldPassword && { password_hash: await bcrypt.hash(password, 8) }),
        updated_at: new Date().toISOString(),
      };

      // Atualiza usuário
      if (Object.keys(updates).length > 1) { // se tiver algo pra atualizar
        const { error: updateUserError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', userId);
        if (updateUserError) throw updateUserError;
      }

      // Atualiza/Cria contato
      if (contact) {
        if (user.contact_id) {
          const { error: updateContactError } = await supabase
            .from('contacts')
            .update(contact)
            .eq('id', user.contact_id);
          if (updateContactError) throw updateContactError;
        } else {
          const { data: contactData, error: createContactError } = await supabase
            .from('contacts')
            .insert([{ ...contact }])
            .select('id')
            .maybeSingle();
          if (createContactError) throw createContactError;
          // Atualiza o id na tabela user
          await supabase
            .from('users')
            .update({ contact_id: contactData.id })
            .eq('id', userId);
        }
      }

      // Atualiza/Cria endereço
      if (address) {
        if (user.address_id) {
          const { error: updateAddressError } = await supabase
            .from('addresses')
            .update(address)
            .eq('id', user.address_id);
          if (updateAddressError) throw updateAddressError;
        } else {
          const { data: addressData, error: createAddressError } = await supabase
            .from('addresses')
            .insert([{ ...address }])
            .select('id')
            .maybeSingle();
          if (createAddressError) throw createAddressError;
          await supabase
            .from('users')
            .update({ address_id: addressData.id })
            .eq('id', userId);
        }
      }

      // Atualiza/Cria profile
      if (profile) {
        if (user.profile_id) {
          const { error: updateProfileError } = await supabase
            .from('profiles')
            .update(profile)
            .eq('id', user.profile_id);
          if (updateProfileError) throw updateProfileError;
        } else {
          const { data: profileData, error: createProfileError } = await supabase
            .from('profiles')
            .insert([{ ...profile }])
            .select('id')
            .maybeSingle();
          if (createProfileError) throw createProfileError;
          await supabase
            .from('users')
            .update({ profile_id: profileData.id })
            .eq('id', userId);
        }
      }

      // Busca atualizado para retorno
      const { data: updated, error: fetchUpdatedError } = await supabase
        .from('users')
        .select(`
          id, name, surname, email,
          profile:profiles(id, name),
          address:addresses(id, address_name, country, state, city, cep),
          contact:contacts(id, telephone, smartphone)
        `)
        .eq('id', userId)
        .maybeSingle();

      if (fetchUpdatedError) throw fetchUpdatedError;

      return res.json(updated);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao atualizar usuário.', details: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const userId = req.params.id;

      const { data: user, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          surname,
          email,
          profile:profiles(id, name),
          contact:contacts(id, telephone, smartphone),
          address:addresses(id, address_name, country, state, city, cep)
        `)
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        return res.status(500).json({ error: 'Erro ao buscar usuário', details: error.message });
      }

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.json({
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        profile: user.profile,
        address: user.address,
        contact: user.contact,
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno ao buscar usuário', details: error.message });
    }
  }

  async deleteTransaction(req, res) {
    const userId = req.params.id;

    try {
      // 1. Busca o usuário com os IDs das associações
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, address_id, contact_id')
        .eq('id', userId)
        .maybeSingle();

      if (userError) throw userError;

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // 2. Deleta associações se existirem
      if (user.address_id) {
        const { error: addressError } = await supabase
          .from('addresses')
          .delete()
          .eq('id', user.address_id);
        if (addressError) throw addressError;
      }

      if (user.contact_id) {
        const { error: contactError } = await supabase
          .from('contacts')
          .delete()
          .eq('id', user.contact_id);
        if (contactError) throw contactError;
      }

      // 3. Deleta o usuário
      const { error: userDelError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (userDelError) throw userDelError;

      // 4. Pronto!
      return res.status(200).json({ message: 'Usuário e suas associações deletados com sucesso.' });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao deletar usuário', details: error.message });
    }
  }


}

export default new UserSupabaseController();
