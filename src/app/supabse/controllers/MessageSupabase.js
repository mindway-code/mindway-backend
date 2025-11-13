import { supabase } from '../../../database/indexSupabase.js';

class MessageSupabaseController {
  async index(req, res) {
    try {
      const socialNetworkId = req.query.socialNetworkId;
      const page     = Number(req.query.page)      || 1;
      const pageSize = Number(req.query.pageSize)  || 20;
      const from     = (page - 1) * pageSize;
      const to       = from + pageSize - 1;

      if (!socialNetworkId) {
        return res.status(400).json({ error: 'Informe o ID da rede social.' });
      }

      const { data: messages, count, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          user:users (id, name, surname, email)
        `, { count: 'exact', head: false })
        .eq('social_network_id', socialNetworkId)
        .order('created_at', { ascending: true }) // cronológico
        .range(from, to);

      if (error) {
        return res.status(500).json({ error: 'Erro ao buscar mensagens.', details: error.message });
      }

      return res.json({
        data: messages,
        meta: {
          totalItems: count,
          totalPages: Math.ceil(count / pageSize),
          currentPage: page,
          perPage: pageSize
        }
      });

    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar mensagens.', details: error.message });
    }
  }


  async store(req, res) {
    const schema = Yup.object().shape({
      social_network_id: Yup.number().required(),
      user_id: Yup.string().required(),
      content: Yup.string().required()
    });

    try {
      await schema.validate(req.body);

      const { data: message, error } = await supabase
        .from('messages')
        .insert([{
          social_network_id: req.body.social_network_id,
          user_id: req.body.user_id,
          content: req.body.content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .maybeSingle();

      if (error || !message) {
        return res.status(400).json({ error: error?.message || 'Erro ao criar mensagem.' });
      }

      return res.status(201).json(message);

    } catch (error) {
      return res.status(400).json({ error: error.errors ? error.errors[0] : error.message || 'Erro na requisição.' });
    }
  }


  async delete(req, res) {
    try {

      const { data: message, error: findError } = await supabase
        .from('messages')
        .select('id')
        .eq('id', req.params.id)
        .maybeSingle();

      if (findError) throw findError;

      if (!message) {
        return res.status(404).json({ error: 'Mensagem não encontrada.' });
      }

      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', req.params.id);

      if (deleteError) {
        return res.status(500).json({ error: 'Erro ao excluir mensagem.' });
      }

      return res.json({ message: 'Mensagem excluída com sucesso.' });

    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir mensagem.', details: error.message });
    }
  }

}

export default new MessageSupabaseController();
