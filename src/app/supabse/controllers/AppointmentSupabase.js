import { supabase } from '../../../database/indexSupabase.js';
import * as Yup from 'yup';
class AppointmentSupabaseController {
  async indexByPatient(req, res) {
    try {
      const userId   = req.userIdSupabase  ;
      const page     = Number(req.query.page)      || 1;
      const pageSize = Number(req.query.pageSize)  || 10;
      const from     = (page - 1) * pageSize;
      const to       = from + pageSize - 1;
      const date     = req.query.date ? req.query.date.trim() : '';

      let query = supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          status,
          note,
          patient:users!fk_appointments_patient (id, name, surname),
          provider:users!fk_appointments_provider (id, name, surname)
        `, { count: 'exact', head: false })
        .eq('patient_id', userId)
        .order('date', { ascending: false })
        .order('time', { ascending: false })
        .range(from, to);

      if (date) {
        query = query.eq('date', date);
      }

      const { data: appointments, count, error } = await query;

      if (error) {
        return res.status(500).json({ error: 'Erro ao buscar agendamentos do usuário.', details: error.message });
      }

      return res.json({
        data: appointments,
        meta: {
          totalItems: count,
          totalPages: Math.ceil(count / pageSize),
          currentPage: page,
          perPage: pageSize,
        }
      });
    } catch (error) {
      console.log(error.message)
      return res.status(500).json({
        error: 'Erro ao buscar agendamentos do usuário.',
        details: error.message,
        id: req.userIdSupabase
      });
    }
  }


  async indexByTherapist(req, res) {
    try {
      const userId   = req.userIdSupabase  ; // adapte conforme middleware
      const page     = Number(req.query.page)      || 1;
      const pageSize = Number(req.query.pageSize)  || 10;
      const from     = (page - 1) * pageSize;
      const to       = from + pageSize - 1;

      const name     = req.query.name ? req.query.name.trim() : '';
      const date     = req.query.date ? req.query.date.trim() : '';

      let query = supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          status,
          note,
          patient:users!fk_appointments_patient (
            id, name, surname
          ),
          provider:users!fk_appointments_provider (
            id, name, surname
          )
        `, { count: 'exact', head: false })
        .eq('provider_id', userId)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (date) {
        query = query.eq('date', date);
      }

      // Paginação
      query = query.range(from, to);

      let { data: appointments, count, error } = await query;

      if (error) {
        return res.status(500).json({
          error: 'Erro ao buscar agendamentos do terapeuta.',
          details: error.message
        });
      }

      // Filtro de nome/sobrenome do paciente (pois Supabase não suporta .or() aninhado no join)
      if (name) {
        appointments = (appointments || []).filter(app =>
          app.patient &&
          (
            app.patient.name?.toLowerCase().includes(name.toLowerCase()) ||
            app.patient.surname?.toLowerCase().includes(name.toLowerCase())
          )
        );
        count = appointments.length; // o total filtrado da página retornada
      }

      return res.json({
        data: appointments,
        meta: {
          totalItems: count,
          totalPages: Math.ceil(count / pageSize),
          currentPage: page,
          perPage: pageSize,
        }
      });

    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        error: 'Erro ao buscar agendamentos do terapeuta.',
        details: error.message
      });
    }
  }


  async indexByTherapistAndDate(req, res) {
    try {
      const therapistId =
        req.query.therapist_id ||
        req.params.therapist_id ||
        req.userIdSupabase ||
        req.userId;
      const date = req.query.date;

      if (!therapistId || !date) {
        return res.status(400).json({ error: 'therapist_id e date são obrigatórios.' });
      }

      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          status,
          note,
          patient_id,
          patient:users!fk_appointments_patient (id, name, surname)
        `)
        .eq('provider_id', therapistId)
        .eq('date', date)
        .order('time', { ascending: true });

      if (error) {
        return res.status(500).json({
          error: 'Erro ao buscar agendamentos do terapeuta nessa data.',
          details: error.message
        });
      }

      return res.json({ data: appointments });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: 'Erro ao buscar agendamentos do terapeuta nessa data.',
        details: error.message
      });
    }
  }


  async indexByDate(req, res) {
    try {
      const { date } = req.query;
      const page     = Number(req.query.page)      || 1;
      const pageSize = Number(req.query.pageSize)  || 10;
      const from     = (page - 1) * pageSize;
      const to       = from + pageSize - 1;

      if (!date) {
        return res.status(400).json({ error: 'Data é obrigatória para buscar agendamentos.' });
      }

      const { data: appointments, count, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time,
          status,
          note,
          patient:users!fk_appointments_patient (id, name, surname),
          provider:users!fk_appointments_provider (id, name, surname)
        `, { count: 'exact', head: false })
        .eq('date', date)
        .order('time', { ascending: true })
        .range(from, to);

      if (error) {
        return res.status(500).json({
          error: 'Erro ao buscar agendamentos por data.',
          details: error.message
        });
      }

      return res.json({
        data: appointments,
        meta: {
          totalItems: count,
          totalPages: Math.ceil(count / pageSize),
          currentPage: page,
          perPage: pageSize,
        }
      });

    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        error: 'Erro ao buscar agendamentos por data.',
        details: error.message
      });
    }
  }



  async store(req, res) {
    const schema = Yup.object().shape({
      patient_id: Yup.string().required(),
      provider_id: Yup.string().required(),
      date: Yup.string().required(),
      time: Yup.string().required(),
      status: Yup.string().default('PENDENTE'),
      note: Yup.string().nullable()
    });

    try {
      // Preenche patient_id/provider_id com userId autenticado, se vier null
      if (req.body.patient_id === null) req.body.patient_id = req.userIdSupabase  ;
      if (req.body.provider_id === null) req.body.provider_id = req.userIdSupabase  ;

      await schema.validate(req.body);

      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert([{
          patient_id: req.body.patient_id,
          provider_id: req.body.provider_id,
          date: req.body.date,
          time: req.body.time,
          status: req.body.status || 'PENDENTE',
          note: req.body.note || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .maybeSingle();

      if (error || !appointment) {
        return res.status(400).json({ error: error?.message || 'Erro ao criar agendamento.' });
      }

      return res.status(201).json(appointment);

    } catch (error) {
      return res.status(400).json({
        error: 'Erro ao criar agendamento.',
        details: error.message
      });
    }
  }


  async update(req, res) {
    const schema = Yup.object().shape({
      date: Yup.string(),
      time: Yup.string(),
      status: Yup.string(),
      note: Yup.string().nullable()
    });

    try {
      await schema.validate(req.body);

      const { id } = req.params;

      // Verifica se existe o agendamento
      const { data: appointment, error: findError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (findError) throw findError;

      if (!appointment) {
        return res.status(404).json({ error: 'Agendamento não encontrado.' });
      }

      // Atualiza o agendamento
      const { data: updated, error: updateError } = await supabase
        .from('appointments')
        .update({
          ...req.body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (updateError) {
        return res.status(400).json({ error: updateError.message || 'Erro ao atualizar agendamento.' });
      }

      return res.json(updated);

    } catch (error) {
      return res.status(400).json({ error: error.errors ? error.errors[0] : error.message || 'Erro ao atualizar agendamento.' });
    }
  }


  async delete(req, res) {
    try {
      const { id } = req.params;

      // Verifica se o agendamento existe
      const { data: appointment, error: findError } = await supabase
        .from('appointments')
        .select('id')
        .eq('id', id)
        .maybeSingle();

      if (findError) throw findError;

      if (!appointment) {
        return res.status(404).json({ error: 'Agendamento não encontrado.' });
      }

      // Remove o agendamento
      const { error: deleteError } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (deleteError) {
        return res.status(500).json({ error: 'Erro ao remover agendamento.' });
      }

      return res.json({ message: 'Agendamento removido com sucesso.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover agendamento.', details: error.message });
    }
  }
}

export default new AppointmentSupabaseController();
