// src/supabase/controllers/SocialNetworkSupabase.js
import { supabase } from '../../../database/indexSupabase.js';

class SocialNetworkSupabaseController {

  async indexByUser(req, res) {
    try {
      const page     = Number(req.query.page)      || 1;
      const pageSize = Number(req.query.pageSize)  || 10;
      const from     = (page - 1) * pageSize;
      const to       = from + pageSize - 1;
      const userId   = req.userIdSupabase;

      const { data: joinRows, error: joinError } = await supabase
        .from('social_network_user')
        .select('social_network_id')
        .eq('user_id', userId);

      if (joinError) {
        return res.status(500).json({ error: 'Erro ao buscar vínculo usuário/rede.', details: joinError.message });
      }

      const networkIds = joinRows?.map(r => r.social_network_id) || [];
      if (!networkIds.length) {
        return res.json({
          data: [],
          meta: {
            totalItems: 0,
            totalPages: 0,
            currentPage: page,
            perPage: pageSize,
          }
        });
      }

      const { data: networks, count, error } = await supabase
        .from('social_network')
        .select(`
          *,
          members:social_network_user (
            user_id,
            user:users (name, surname, email)
          )
        `, { count: 'exact', head: false })
        .in('id', networkIds)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        return res.status(500).json({ error: 'Erro ao buscar redes sociais.', details: error.message });
      }

      return res.status(200).json({
        data: networks,
        meta: {
          totalItems: count,
          totalPages: Math.ceil(count / pageSize),
          currentPage: page,
          perPage: pageSize,
        }
      });

    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao buscar redes sociais.',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name:        Yup.string().required('Nome obrigatório'),
      description: Yup.string().nullable()
    });

    try {
      await schema.validate(req.body);

      // Verifica se já existe uma rede com esse nome
      const { data: exists, error: findError } = await supabase
        .from('social_networks')
        .select('id')
        .eq('name', req.body.name)
        .maybeSingle();

      if (findError) throw findError;

      if (exists) {
        return res.status(400).json({ error: 'Rede social já existe com esse nome.' });
      }

      // Cria nova rede social
      const { data: socialNetwork, error: createError } = await supabase
        .from('social_networks')
        .insert([{
          name: req.body.name,
          description: req.body.description || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .maybeSingle();

      if (createError) {
        return res.status(400).json({ error: createError.message || 'Erro ao criar rede social.' });
      }

      return res.status(201).json(socialNetwork);

    } catch (error) {
      return res.status(400).json({ error: error.errors ? error.errors[0] : error.message || 'Erro na requisição.' });
    }
  }


  async storeByUser(req, res) {
    const schema = Yup.object().shape({
      name:        Yup.string().required('Nome obrigatório'),
      description: Yup.string().nullable()
    });

    try {
      await schema.validate(req.body);

      // Verifica se já existe uma rede com esse nome
      const { data: exists, error: findError } = await supabase
        .from('social_networks')
        .select('id')
        .eq('name', req.body.name)
        .maybeSingle();

      if (findError) throw findError;

      if (exists) {
        return res.status(400).json({ error: 'Rede social já existe com esse nome.' });
      }

      // Cria nova rede social
      const { data: socialNetwork, error: createError } = await supabase
        .from('social_networks')
        .insert([{
          name: req.body.name,
          description: req.body.description || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .maybeSingle();

      if (createError || !socialNetwork) {
        return res.status(400).json({ error: createError?.message || 'Erro ao criar rede social.' });
      }

      // Associa o usuário logado à rede criada
      const user_id = req.userIdSupabase;

      const { error: joinError } = await supabase
        .from('social_network_user')
        .insert([{
          social_network_id: socialNetwork.id,
          user_id: user_id
        }]);

      if (joinError) {
        // se falhar a associação, poderia remover a rede criada, mas normalmente só retorna erro
        return res.status(400).json({ error: joinError.message || 'Erro ao associar usuário à rede social.' });
      }

      return res.status(201).json(socialNetwork);

    } catch (error) {
      return res.status(400).json({ error: error.errors ? error.errors[0] : error.message || 'Erro na requisição.' });
    }
  }


  async update(req, res) {
    const schema = Yup.object().shape({
      name:        Yup.string().required('Nome obrigatório'),
      description: Yup.string().nullable()
    });

    try {
      await schema.validate(req.body);

      // Verifica se existe a rede social pelo id
      const { data: socialNetwork, error: findError } = await supabase
        .from('social_networks')
        .select('*')
        .eq('id', req.params.id)
        .maybeSingle();

      if (findError) throw findError;

      if (!socialNetwork) {
        return res.status(404).json({ error: 'Rede social não encontrada.' });
      }

      // Atualiza a rede social
      const { data: updated, error: updateError } = await supabase
        .from('social_networks')
        .update({
          name: req.body.name,
          description: req.body.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .select()
        .maybeSingle();

      if (updateError) {
        return res.status(400).json({ error: updateError.message || 'Erro ao atualizar rede social.' });
      }

      return res.json(updated);

    } catch (error) {
      return res.status(400).json({ error: error.errors ? error.errors[0] : error.message || 'Erro na requisição.' });
    }
  }


  async delete(req, res) {
    try {
      // Verifica se existe
      const { data: socialNetwork, error: findError } = await supabase
        .from('social_networks')
        .select('id')
        .eq('id', req.params.id)
        .maybeSingle();

      if (findError) throw findError;

      if (!socialNetwork) {
        return res.status(404).json({ error: 'Rede social não encontrada.' });
      }

      // Remove a rede social
      const { error: deleteError } = await supabase
        .from('social_networks')
        .delete()
        .eq('id', req.params.id);

      if (deleteError) {
        return res.status(500).json({ error: 'Erro ao excluir rede social.' });
      }

      return res.json({ message: 'Rede social excluída com sucesso.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir rede social.', details: error.message });
    }
  }
}

export default new SocialNetworkSupabaseController();
