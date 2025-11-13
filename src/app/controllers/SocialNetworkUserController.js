import * as Yup from 'yup';
import SocialNetworkUser from '../models/SocialNetworkUser.js';
import SocialNetwork from '../models/SocialNetwork.js';
import User from '../models/User.js';

class SocialNetworkUserController {
  /**
   * GET /social-network-users?socialNetworkId=1&page=1&pageSize=10
   */
  async index(req, res) {
    try {
      const socialNetworkId = req.query.socialNetworkId;
      const page     = Number(req.query.page)      || 1;
      const pageSize = Number(req.query.pageSize)  || 10;
      const limit    = Number(req.query.limit)     || pageSize;
      const offset   = (page - 1) * limit;

      const where = socialNetworkId ? { social_network_id: socialNetworkId } : {};

      const { count, rows } = await SocialNetworkUser.findAndCountAll({
        where,
        limit,
        offset,
        include: [
          {
            model: SocialNetwork,
            as: 'socialNetwork',
            attributes: ['id', 'name', 'description'],
            order: [['name', 'ASC']],
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'surname', 'email', 'profile_id']
          }
        ]
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
      return res.status(500).json({ error: 'Erro ao buscar membros da rede.', details: error.message });
    }
  }


  /**
   * POST /social-network-users
   * { social_network_id, user_id }
   */
  async store(req, res) {
    const schema = Yup.object().shape({
      social_network_id: Yup.number().required(),
      user_id: Yup.string().required() // UUID
    });

    try {
      await schema.validate(req.body);

      // Não permitir duplicidade
      const exists = await SocialNetworkUser.findOne({
        where: {
          social_network_id: req.body.social_network_id,
          user_id: req.body.user_id
        }
      });
      if (exists) {
        return res.status(400).json({ error: 'Usuário já está associado a esta rede.' });
      }

      const member = await SocialNetworkUser.create({
        ...req.body,
        joined_at: new Date()
      });

      return res.status(201).json(member);
    } catch (error) {
      return res.status(400).json({ error: error.errors ? error.errors[0] : 'Erro na requisição.' });
    }
  }

  /**
   * DELETE /social-network-users/:id
   */
  async delete(req, res) {
    try {
      const member = await SocialNetworkUser.findByPk(req.params.id);
      if (!member) {
        return res.status(404).json({ error: 'Associação não encontrada.' });
      }

      await member.destroy();

      return res.json({ message: 'Usuário removido da rede com sucesso.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao remover usuário da rede.' });
    }
  }
}

export default new SocialNetworkUserController();
