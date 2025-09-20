import * as Yup from "yup";
import FamilyMember from "../models/Family_Member.js";
import Family from "../models/Family.js";
import User from "../models/User.js";

class FamilyMemberController {
  /**
   * GET /family-members
   * Opcional: ?family_id=xx para filtrar por família
   */
  async index(req, res) {
    try {
      // const { family_id } = req.query;

      // const where = family_id ? { family_id } : {};

      const members = await FamilyMember.findAll({
        // where,
        include: [
          {
            model: Family,
            as: "family",
            attributes: ["id", "name"],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "surname", "email"],
          },
        ],
      });

      return res.json(members);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao listar membros da família." });
    }
  }

  /**
   * POST /family-members
   */
  async store(req, res) {
    try {
      const schema = Yup.object().shape({
        family_id: Yup.number().required(),
        user_id: Yup.string().uuid().required(),
        role: Yup.string().required(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: "Validação falhou." });
      }

      // Verifica existência da família e do usuário
      const [family, user] = await Promise.all([
        Family.findByPk(req.body.family_id),
        User.findByPk(req.body.user_id),
      ]);

      if (!family) return res.status(404).json({ error: "Família não encontrada." });
      if (!user) return res.status(404).json({ error: "Familiar não encontrado." });

      const member = await FamilyMember.create(req.body);

      return res.status(201).json(member);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar membro da família." });
    }
  }

  /**
   * PUT /family-members/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const schema = Yup.object().shape({
        role: Yup.string().required(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: "Validação falhou." });
      }

      const member = await FamilyMember.findByPk(id);
      if (!member) return res.status(404).json({ error: "Membro não encontrado." });

      await member.update({ role: req.body.role });

      return res.json(member);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao atualizar membro da família." });
    }
  }

  /**
   * DELETE /family-members/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      const member = await FamilyMember.findByPk(id);
      if (!member) return res.status(404).json({ error: "Membro não encontrado." });

      await member.destroy();

      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao remover membro da família." });
    }
  }
}

export default new FamilyMemberController();
