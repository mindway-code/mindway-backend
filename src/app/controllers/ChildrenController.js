import * as Yup from "yup";
import Children from "../models/Children.js";
import Family from "../models/Family.js";

class ChildrenController {
  /**
   * GET /children
   * Query params:
   *   - family_id (optional) => filtra crianças de uma família específica
   */
  async index(req, res) {
    try {
      const { family_id } = req.query;

      const where = family_id ? { family_id } : {};

      const children = await Children.findAll({
        where,
        include: [
          {
            model: Family,
            as: "family",
            attributes: ["id", "name"],
          },
        ],
        order: [
          ["surname", "ASC"],
          ["name", "ASC"],
        ],
      });

      return res.json(children);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao listar crianças" });
    }
  }

  /**
   * POST /children
   * Body: { name, surname, age, number, family_id }
   */
  async store(req, res) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        surname: Yup.string().required(),
        age: Yup.number().integer().positive().required(),
        number: Yup.string().required(),
        family_id: Yup.string().nullable(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: "Validação falhou" });
      }

      const child = await Children.create(req.body);

      return res.status(201).json(child);
    } catch (err) {
      console.error(err);
      // Erro de violação de unicidade no campo "number"
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({ error: "Número já existe" });
      }
      return res.status(500).json({ error: "Erro ao criar criança" });
    }
  }

  /**
   * PUT /children/:id
   */
  async update(req, res) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string(),
        surname: Yup.string(),
        age: Yup.number().integer().positive(),
        number: Yup.string(),
        family_id: Yup.string().uuid().nullable(),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: "Validação falhou" });
      }

      const { id } = req.params;
      const child = await Children.findByPk(id);

      if (!child) {
        return res.status(404).json({ error: "Criança não encontrada" });
      }

      await child.update(req.body);

      return res.json(child);
    } catch (err) {
      console.error(err);
      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({ error: "Número já existe" });
      }
      return res.status(500).json({ error: "Erro ao atualizar criança" });
    }
  }

  /**
   * DELETE /children/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;
      const child = await Children.findByPk(id);

      if (!child) {
        return res.status(404).json({ error: "Criança não encontrada" });
      }

      await child.destroy();
      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao deletar criança" });
    }
  }
}

export default new ChildrenController();
