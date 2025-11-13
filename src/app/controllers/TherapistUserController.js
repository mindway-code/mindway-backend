import { Op } from 'sequelize';
import User from '../models/User';
import TherapistUser from '../models/Therapist_User';


class TherapistUserController {

  async index(req, res) {
    try {
      const { user_id, therapist_id } = req.query;
      const where = {};
      if (user_id) where.user_id = user_id;
      if (therapist_id) where.therapist_id = therapist_id;

      const associations = await TherapistUser.findAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'surname', 'email'] },
          { model: User, as: 'therapist', attributes: ['id', 'name', 'surname', 'email'] }
        ],
        order: [['created_at', 'DESC']]
      });

      return res.json({ data: associations });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao listar associações.', details: error.message });
    }
  }

  // Lista só os terapeutas associados ao usuário logado (endpoint /associated)
  async indexAssociated(req, res) {
    try {
      const userId = req.userId;
      const associations = await TherapistUser.findAll({
        where: { user_id: userId },
        include: [
          { model: User, as: 'therapist', attributes: ['id', 'name', 'surname', 'email'] }
        ],
        order: [['created_at', 'DESC']]
      });

      const therapists = associations.map(assoc => assoc.therapist);
      return res.json(therapists);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar terapeutas associados.', details: error.message });
    }
  }

  // Cria nova associação user <-> therapist
  async store(req, res) {
    try {
      const { therapist_id } = req.userId;
      const user_id =  req.body;

      if (!therapist_id) return res.status(400).json({ error: 'therapist_id é obrigatório.' });

      // Evita duplicidade
      const exists = await TherapistUser.findOne({ where: { user_id, therapist_id } });
      if (exists) return res.status(400).json({ error: 'Associação já existe.' });

      const assoc = await TherapistUser.create({ user_id, therapist_id });
      return res.status(201).json(assoc);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar associação.', details: error.message });
    }
  }

  // Atualiza associação (ex: status, notas)
  async update(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const assoc = await TherapistUser.findByPk(id);
      if (!assoc) return res.status(404).json({ error: 'Associação não encontrada.' });

      if (status !== undefined) assoc.status = status;

      await assoc.save();
      return res.json(assoc);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar associação.', details: error.message });
    }
  }

  // Remove associação
  async delete(req, res) {
    try {
      const { id } = req.params;

      const assoc = await TherapistUser.findByPk(id);
      if (!assoc) return res.status(404).json({ error: 'Associação não encontrada.' });

      await assoc.destroy();
      return res.json({ message: 'Associação removida com sucesso.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover associação.', details: error.message });
    }
  }
}

export default new TherapistUserController();
