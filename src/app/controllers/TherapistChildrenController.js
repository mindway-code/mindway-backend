import User from "../models/User";
import TherapistChildren from "../models/Therapist_Children";
import Family from "../models/Family";
import FamilyMember from "../models/Family_Member";
import Children from "../models/Children";
import * as Yup from 'yup';

class TherapistChildrenController {
  async index(req, res) {
    try {
      const therapistChildren = await TherapistChildren.findAll({
        include: [
          {
            model: Children,
            as: 'child',
            attributes: ['id', 'name', 'surname', 'age'],
            include: [
              { model: Family, as: 'family', attributes: ['id', 'name'] }
            ]
          },
          {
            model: User,
            as: "therapist",
            attributes: ["id", "name", "email", "surname"],
          },
        ],
      });

      return res.json(therapistChildren);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar crianças associadas ao terapeuta." });
    }
  }
  async indexByReqUser(req, res) {
    try {
      const therapistChildren = await TherapistChildren.findAll({
        where: { therapist_id: req.userId },
        include: [
          {
            model: Children,
            as: 'child',
            attributes: ['id', 'name', 'surname', 'age'],
            include: [
              {
                model: Family,
                as: 'family',
                attributes: ['id', 'name'],
              }
            ]
          },
          {
            model: User,
            as: "therapist",
            attributes: ["id", "name", "email", "surname"],
          },
        ],
      });
      return res.json(therapistChildren);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar crianças associadas ao terapeuta." });
    }
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      child_id: Yup.number().required(),
      therapist_id: Yup.string().uuid().optional(), // therapist_id is optional, can be set to the current user
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validação falhou." });
    }

    const { child_id, therapist_id } = req.body;

    const childExists = await Children.findByPk(child_id);
    if (!childExists) {
      return res.status(404).json({ error: "Criança não encontrada." });
    }

    const therapistChildren = await TherapistChildren.create({
      child_id,
      therapist_id: therapist_id || req.userId,
    });

    return res.json(therapistChildren);
  }

  async update(req, res) {

    const { id } = req.params;

    const schema = Yup.object().shape({
      child_id: Yup.number().required(),
      therapist_id: Yup.string().uuid().optional(), // therapist_id is optional, can be set to the current user
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validação falhou." });
    }
    const { child_id, therapist_id } = req.body;
    const therapistChild = await TherapistChildren.findByPk(id);
    if (!therapistChild) {
      return res.status(404).json({ error: "Relação terapeuta-criança não encontrada." });
    }
    const childExists = await Children.findByPk(child_id);
    if (!childExists) {
      return res.status(404).json({ error: "Criança não encontrada." });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    if (therapist_id !== req.userId || (user.profile_id !== 2 && user.profile_id !== 3)) {
      return res.status(403).json({ error: "Você não tem permissão para atualizar esta relação." });
    }

    try {
      const updatedTherapistChild = await therapistChild.update({
        child_id,
        therapist_id: therapist_id || req.userId,
      });

      return res.json(updatedTherapistChild);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar a relação terapeuta-criança." });
    }
  }

  async delete(req, res) {
    const { id } = req.params;

    const therapistChild = await TherapistChildren.findByPk(id);
    if (!therapistChild) {
      return res.status(404).json({ error: "Relação terapeuta-criança não encontrada." });
    }

    await therapistChild.destroy();
    return res.status(204).send();
  }
}

export default new TherapistChildrenController();
