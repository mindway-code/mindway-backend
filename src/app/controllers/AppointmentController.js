import * as Yup from 'yup';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';


class AppointmentController {

  async index(req, res) {
    try {
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const limit = Number(req.query.limit) || pageSize;
      const offset = (page - 1) * limit;

      const { count, rows } = await Appointment.findAndCountAll({
        limit,
        offset,
        include: [
          { model: User, as: 'patient', attributes: ['id', 'name', 'surname'] },
          { model: User, as: 'provider', attributes: ['id', 'name', 'surname'] }
        ],
        order: [['date', 'DESC'], ['time', 'DESC']],
      });

      return res.json({
        data: rows,
        meta: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          perPage: limit,
        }
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar agendamentos',
        details: error.message
      });
    }
  }

  async indexByPatient(req, res) {
    try {

      const userId = req.userId;
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const limit = Number(req.query.limit) || pageSize;
      const offset = (page - 1) * limit;

      const date = req.query.date ? req.query.date.trim() : '';

      let where = { patient_id: userId };

      if (date) {
        where.date = date;
      }

      const include = [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'name', 'surname'],
        },
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name', 'surname']
        }
      ];

      const { count, rows } = await Appointment.findAndCountAll({
        where,
        limit,
        include,
        offset,
        attributes: ['id', 'date', 'time', 'status', 'note'],
        order: [['date', 'DESC'], ['time', 'DESC']],
        distinct: true
      });

      return res.json({
        data: rows,
        meta: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          perPage: limit,
        }
      });
    } catch (error) {
      console.log(error.message)
      return res.status(500).json({ error: 'Erro ao buscar agendamentos do usuário.',
        details: error.message
      });
    }
  }


  async indexByTherapistAndDate(req, res) {
    try {

      const therapistId = req.query.therapist_id || req.params.therapist_id || req.userId;
      const date = req.query.date;

      if (!therapistId || !date) {
        return res.status(400).json({ error: 'therapist_id e date são obrigatórios.' });
      }

      const appointments = await Appointment.findAll({
        where: {
          provider_id: therapistId,
          date: date,
        },
        attributes: ['id', 'date', 'time', 'status', 'note', 'patient_id'],
        include: [
          {
            model: User,
            as: 'patient',
            attributes: ['id', 'name', 'surname']
          }
        ],
        order: [['time', 'ASC']]
      });

      return res.json({ data: appointments });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        error: 'Erro ao buscar agendamentos do terapeuta nessa data.',
        details: error.message
      });
    }
  }

  async indexByTherapist(req, res) {
    try {
      const userId = req.userId;
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const limit = Number(req.query.limit) || pageSize;
      const offset = (page - 1) * limit;

      const name = req.query.name ? req.query.name.trim() : '';
      const date = req.query.date ? req.query.date.trim() : '';

      let where = { provider_id: userId };

      if (date) {
        where.date = date;
      }

      const include = [
        {
          model: User,
          as: 'patient',
          attributes: ['id', 'name', 'surname'],
          required: !!name, // se tiver nome, faz inner join (filtra)
          where: name
            ? {
                [Op.or]: [
                  { name: { [Op.iLike]: `%${name}%` } },
                  { surname: { [Op.iLike]: `%${name}%` } }
                ]
              }
            : undefined
        },
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name', 'surname']
        }
      ];

      const { count, rows } = await Appointment.findAndCountAll({
        where,
        limit,
        offset,
        attributes: ['id', 'date', 'time', 'status', 'note'],
        include,
        order: [['date', 'DESC'], ['time', 'DESC']],
        distinct: true
      });

      return res.json({
        data: rows,
        meta: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          perPage: limit,
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

  async indexByDate(req, res) {
    try {
      const { date } = req.query;
      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;
      const limit = Number(req.query.limit) || pageSize;
      const offset = (page - 1) * limit;

      if (!date) {
        return res.status(400).json({ error: 'Data é obrigatória para buscar agendamentos.' });
      }

      const { count, rows } = await Appointment.findAndCountAll({
        where: { date },
        limit,
        offset,
        include: [
          { model: User, as: 'patient', attributes: ['id', 'name', 'surname'] },
          { model: User, as: 'provider', attributes: ['id', 'name', 'surname'] }
        ],
        order: [['time', 'ASC']],
      });

      return res.json({
        data: rows,
        meta: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          perPage: limit,
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

      if(req.body.patient_id === null) req.body.patient_id = req.userId;
      if(req.body.provider_id === null) req.body.provider_id = req.userId;

      await schema.validate(req.body);


      const appointment = await Appointment.create({
        patient_id: req.body.patient_id,
        provider_id: req.body.provider_id,
        date: req.body.date,
        time: req.body.time,
        status: req.body.status || 'PENDENTE',
        note: req.body.note || null,
      });

      return res.status(201).json(appointment);
    } catch (error) {
      return res.status(400).json({ error: error.errors ? error.errors[0] : 'Erro ao criar agendamento.' });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      date: Yup.string(),
      time: Yup.string(),
      status: Yup.string(),
      notes: Yup.string().nullable()
    });

    try {
      await schema.validate(req.body);

      const { id } = req.params;
      const appointment = await Appointment.findByPk(id);

      if (!appointment) {
        return res.status(404).json({ error: 'Agendamento não encontrado.' });
      }

      await appointment.update(req.body);

      return res.json(appointment);
    } catch (error) {
      return res.status(400).json({ error: error.errors ? error.errors[0] : 'Erro ao atualizar agendamento.' });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const appointment = await Appointment.findByPk(id);

      if (!appointment) {
        return res.status(404).json({ error: 'Agendamento não encontrado.' });
      }

      await appointment.destroy();

      return res.json({ message: 'Agendamento removido com sucesso.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover agendamento.' });
    }
  }
}

export default new AppointmentController();
