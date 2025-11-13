import * as Yup from 'yup';
import Message from '../models/Message.js';
import SocialNetwork from '../models/SocialNetwork.js';
import User from '../models/User.js';

class MessageController {
  /**
   * GET /messages?socialNetworkId=1&page=1&pageSize=20
   * Lista mensagens de uma social network (paginado)
   */
  async index(req, res) {
    try {
      const socialNetworkId = req.query.socialNetworkId;
      const page     = Number(req.query.page)      || 1;
      const pageSize = Number(req.query.pageSize)  || 20;
      const limit    = Number(req.query.limit)     || pageSize;
      const offset   = (page - 1) * limit;

      if (!socialNetworkId) {
        return res.status(400).json({ error: 'Informe o ID da rede social.' });
      }

      const { count, rows } = await Message.findAndCountAll({
        where: { social_network_id: socialNetworkId },
        limit,
        offset,
        order: [['created_at', 'ASC']], // cronológico
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'surname', 'email']
          }
        ]
      });

      return res.json({
        data: rows,
        meta: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          perPage: limit
        }
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar mensagens.' });
    }
  }

  /**
   * POST /messages
   * { social_network_id, user_id, content }
   */
  async store(req, res) {
    const schema = Yup.object().shape({
      social_network_id: Yup.number().required(),
      user_id: Yup.string().required(), // UUID
      content: Yup.string().required()
    });

    try {
      await schema.validate(req.body);

      const message = await Message.create({
        social_network_id: req.body.social_network_id,
        user_id: req.body.user_id,
        content: req.body.content,
        created_at: new Date(),
        updated_at: new Date()
      });

      return res.status(201).json(message);
    } catch (error) {
      return res.status(400).json({ error: error.errors ? error.errors[0] : 'Erro na requisição.' });
    }
  }

  /**
   * DELETE /messages/:id
   */
  async delete(req, res) {
    try {
      const message = await Message.findByPk(req.params.id);
      if (!message) {
        return res.status(404).json({ error: 'Mensagem não encontrada.' });
      }

      await message.destroy();

      return res.json({ message: 'Mensagem excluída com sucesso.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir mensagem.' });
    }
  }
}

export default new MessageController();
