import * as Yup from "yup";
import Family from "../models/Family.js";
import FamilyMember from "../models/Family_Member.js";
import Children from "../models/Children.js";
import User from "../models/User.js";

class FamilyController {
  /**
   * GET /families
   * Lista todas as famílias com seus membros e crianças.
   */
async index(req, res) {
  try {
    // Pega os valores ou define padrão
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;

    const { count, rows: families } = await Family.findAndCountAll({
      attributes: ["name"],
      include: [
        {
          model: FamilyMember,
          as: "members",
          attributes: ["role"],
          include: [
            {
              model: User,
              as: "member",
              attributes: ["name", "surname", "email"],
            },
          ],
        },
        {
          model: Children,
          as: "children",
          attributes: ["name", "surname", "age", "number"],
        },
      ],
      limit,
      offset,
      distinct: true, // garante contagem correta ao usar includes
    });

    return res.json({
      total: count,
      limit,
      offset,
      totalPages: Math.ceil(count / limit),
      currentPage: Math.floor(offset / limit) + 1,
      families,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao listar famílias." });
  }
}


  /**
   * POST /families
   * Cria uma nova família.
   */
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validação falhou" });
    }

    try {
      const { name } = req.body;

      const family = await Family.create({ name });

      return res.status(201).json(family);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao criar família." });
    }
  }

  /**
   * PUT /families/:id
   * Atualiza dados de uma família.
   */
  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: "Validação falhou" });
    }

    try {
      const family = await Family.findByPk(req.params.id);

      if (!family) {
        return res.status(404).json({ error: "Família não encontrada." });
      }

      await family.update(req.body);

      return res.json(family);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao atualizar família." });
    }
  }

  /**
   * DELETE /families/:id
   * Remove uma família.
   */
  async delete(req, res) {
    try {
      const family = await Family.findByPk(req.params.id);

      if (!family) {
        return res.status(404).json({ error: "Família não encontrada." });
      }

      await family.destroy();

      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao excluir família." });
    }
  }
}

export default new FamilyController();
