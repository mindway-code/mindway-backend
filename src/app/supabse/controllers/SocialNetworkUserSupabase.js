import { supabase } from '../../../database/indexSupabase.js';

class SocialNetworkUserSupabaseController {
  async index(req, res) {
    try {
      const socialNetworkId = req.query.socialNetworkId;
      const page     = Number(req.query.page)      || 1;
      const pageSize = Number(req.query.pageSize)  || 10;
      const from     = (page - 1) * pageSize;
      const to       = from + pageSize - 1;

      // Monta o filtro dinâmico
      let query = supabase
        .from('social_network_user')
        .select(`
          id,
          social_network: social_networks (id, name, description),
          user: users (id, name, surname, email, profile_id)
        `, { count: 'exact', head: false })
        .order('id', { ascending: true }) // ordenação padrão

      if (socialNetworkId) {
        query = query.eq('social_network_id', socialNetworkId);
      }

      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) {
        return res.status(500).json({ error: 'Erro ao buscar membros da rede.', details: error.message });
      }

      return res.json({
        data,
        meta: {
          totalItems: count,
          totalPages: Math.ceil(count / pageSize),
          currentPage: page,
          perPage: pageSize,
        }
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar membros da rede.', details: error.message });
    }
  }


  async store(req, res) {
    const schema = Yup.object().shape({
      social_network_id: Yup.number().required(),
      user_id: Yup.string().required() // UUID
    });

    try {
      await schema.validate(req.body);


      const { data: exists, error: findError } = await supabase
        .from('social_network_user')
        .select('id')
        .eq('social_network_id', req.body.social_network_id)
        .eq('user_id', req.body.user_id)
        .maybeSingle();

      if (findError) throw findError;

      if (exists) {
        return res.status(400).json({ error: 'Usuário já está associado a esta rede.' });
      }


      const { data: member, error: createError } = await supabase
        .from('social_network_user')
        .insert([{
          ...req.body,
          joined_at: new Date().toISOString(),
        }])
        .select()
        .maybeSingle();

      if (createError || !member) {
        return res.status(400).json({ error: createError?.message || 'Erro ao associar usuário.' });
      }

      return res.status(201).json(member);
    } catch (error) {
      return res.status(400).json({ error: error.errors ? error.errors[0] : error.message || 'Erro na requisição.' });
    }
  }


  async delete(req, res) {
    try {

      const { data: member, error: findError } = await supabase
        .from('social_network_user')
        .select('id')
        .eq('id', req.params.id)
        .maybeSingle();

      if (findError) throw findError;

      if (!member) {
        return res.status(404).json({ error: 'Associação não encontrada.' });
      }

      const { error: deleteError } = await supabase
        .from('social_network_user')
        .delete()
        .eq('id', req.params.id);

      if (deleteError) {
        return res.status(500).json({ error: 'Erro ao remover usuário da rede.' });
      }

      return res.json({ message: 'Usuário removido da rede com sucesso.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover usuário da rede.', details: error.message });
    }
  }
}

export default new SocialNetworkUserSupabaseController();
