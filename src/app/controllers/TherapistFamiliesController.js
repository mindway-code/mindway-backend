import * as Yup from 'yup';
import TherapistFamilies from '../models/Therapist_Families.js';
import Family from '../models/Family.js';
import User from '../models/User.js';
import FamilyMember from '../models/Family_Member.js';
import Children from '../models/Children.js';


class TherapistFamiliesController {
  async index(req, res) {
    try {
      const therapistFamilies = await TherapistFamilies.findAll({
        include: [
          {
            model: Family,
            as: 'family',
            attributes: ['id', 'name'],
            include: [
              {
                model: FamilyMember,
                as: 'members',
                attributes: ['id', 'role'],
                include: [
                  { model: User, as: 'user', attributes: ['id', 'name', 'email', 'surname'] }
                ]
              },
              {
                model: Children,
                as: 'children',
                attributes: ['id', 'name', 'surname', 'age'],
              }
            ]
          },
          {
            model: User,
            as: 'therapist',
            attributes: ['id', 'name', 'email', 'surname'],
          },
        ],
      });

      return res.json(therapistFamilies);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar terapeutas e famílias.' });
    }
  }

  async indexByReqUser(req, res) {
    try {
      const therapistFamilies = await TherapistFamilies.findAll({
        where: { therapist_id: req.userId },
        include: [
          {
            model: Family,
            as: 'family',
            attributes: ['id', 'name'],
            include: [
              {
                model: FamilyMember, as: 'members',
                include: [
                  { model: User, as: 'user', attributes: ['id', 'name', 'email', 'surname'] }
                ]
              }
            ]
          },
          {
            model: User,
            as: 'therapist',
            attributes: ['id', 'name', 'email', 'surname'],
          }
        ],
      });
      return res.json(therapistFamilies);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar famílias associadas ao terapeuta.' });
    }
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      family_id: Yup.number().required(),
      therapist_id: Yup.string().uuid().optional(), // therapist_id is optional, can be set to the current user
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validação falhou.' });
    }

    const { family_id, therapist_id  } = req.body;

    const familyExists = await Family.findByPk(family_id);

    if (!familyExists) {
      return res.status(400).json({ error: 'Família não encontrada.' });
    }

    try {
      const therapistFamily = await TherapistFamilies.create({
        therapist_id: therapist_id || req.userId,
        family_id,
      });

      return res.json(therapistFamily);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao associar terapeuta com a família.' });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      family_id: Yup.number().required(),
      therapist_id: Yup.string().uuid().optional(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validação falhou.' });
    }
    const { id } = req.params;
    const { family_id, therapist_id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID da associação é obrigatório.' });
    }

    const therapistFamily = await TherapistFamilies.findByPk(id);

    if (!therapistFamily) {
      return res.status(400).json({ error: 'Associação não encontrada.' });
    }

    const familyExists = await Family.findByPk(family_id);

    if (!familyExists) {
      return res.status(400).json({ error: 'Família não encontrada.' });
    }

    const user = await User.findByPk(req.userId);

    if (therapistFamily.therapist_id !== req.userId || (user.profile_id !== 2 && user.profile_id !== 3) ) {
      return res.status(401).json({ error: 'Você não tem permissão para atualizar esta associação.' });
    }

    try {
      const updatedTherapistFamily = await therapistFamily.update({
        family_id,
        therapist_id: therapist_id || req.userId,
      });
      return res.json(updatedTherapistFamily);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar associação.' });
    }
  }

  async delete(req, res) {
    const { id } = req.params;

    const therapistFamily = await TherapistFamilies.findByPk(id);

    if (!therapistFamily) {
      return res.status(400).json({ error: 'Associação não encontrada.' });
    }

    const user = await User.findByPk(req.userId);

    if (therapistFamily.therapist_id !== req.userId || user.profile_id !== 2) {
      return res.status(401).json({ error: 'Você não tem permissão para excluir esta associação.' });
    }

    try {
      await therapistFamily.destroy();
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir associação.' });
    }
  }
}

export default new TherapistFamiliesController();
