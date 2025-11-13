import { supabase } from '../../../database/indexSupabase.js';

class TherapistUserSupabaseController {
  async indexAssociated(req, res) {
    try {
      const userId = req.userIdSupabase || req.userId; // ajuste conforme seu middleware

      // Busca as associações deste usuário, trazendo dados do terapeuta
      const { data: associations, error } = await supabase
        .from('therapist_user')
        .select(`
          id,
          therapist:users (id, name, surname, email)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(500).json({ error: 'Erro ao buscar terapeutas associados.', details: error.message });
      }

      // Extrai apenas o array de terapeutas (remove fields extras da associação)
      const therapists = (associations || []).map(assoc => assoc.therapist);

      return res.json(therapists);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar terapeutas associados.', details: error.message });
    }
  }


  async store(req, res) {
    try {

      const therapist_id = req.userIdSupabase || req.userId;
      const { user_id } = req.body;

      if (!therapist_id) {
        return res.status(400).json({ error: 'therapist_id é obrigatório.' });
      }
      if (!user_id) {
        return res.status(400).json({ error: 'user_id é obrigatório.' });
      }

      // Evita duplicidade
      const { data: exists, error: findError } = await supabase
        .from('therapist_user')
        .select('id')
        .eq('user_id', user_id)
        .eq('therapist_id', therapist_id)
        .maybeSingle();

      if (findError) throw findError;

      if (exists) {
        return res.status(400).json({ error: 'Associação já existe.' });
      }

      // Cria associação
      const { data: assoc, error: createError } = await supabase
        .from('therapist_user')
        .insert([{
          user_id,
          therapist_id,
          created_at: new Date().toISOString()
        }])
        .select()
        .maybeSingle();

      if (createError || !assoc) {
        return res.status(500).json({ error: createError?.message || 'Erro ao criar associação.' });
      }

      return res.status(201).json(assoc);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar associação.', details: error.message });
    }
  }


  async update(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Busca se a associação existe
      const { data: assoc, error: findError } = await supabase
        .from('therapist_user')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (findError) throw findError;

      if (!assoc) {
        return res.status(404).json({ error: 'Associação não encontrada.' });
      }

      // Atualiza status
      const { data: updated, error: updateError } = await supabase
        .from('therapist_user')
        .update({
          ...(status !== undefined && { status }),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (updateError) {
        return res.status(500).json({ error: updateError.message || 'Erro ao atualizar associação.' });
      }

      return res.json(updated);

    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar associação.', details: error.message });
    }
  }


  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verifica se existe a associação
      const { data: assoc, error: findError } = await supabase
        .from('therapist_user')
        .select('id')
        .eq('id', id)
        .maybeSingle();

      if (findError) throw findError;

      if (!assoc) {
        return res.status(404).json({ error: 'Associação não encontrada.' });
      }

      // Remove a associação
      const { error: deleteError } = await supabase
        .from('therapist_user')
        .delete()
        .eq('id', id);

      if (deleteError) {
        return res.status(500).json({ error: 'Erro ao remover associação.' });
      }

      return res.json({ message: 'Associação removida com sucesso.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover associação.', details: error.message });
    }
  }
}

export default new TherapistUserSupabaseController();
