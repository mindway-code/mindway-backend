import * as Yup from 'yup';
import SocialNetwork from '../models/SocialNetwork.js';
import SocialNetworkUser from '../models/SocialNetworkUser.js';
import User from '../models/User.js';

class SocialNetworkController {
  /**
   * GET /social-networks?page=1&pageSize=10
   */
  async index(req, res) {
    try {
      const page     = Number(req.query.page)      || 1;
      const pageSize = Number(req.query.pageSize)  || 10;
      const limit    = Number(req.query.limit)     || pageSize;
      const offset   = (page - 1) * limit;

      const { count, rows } = await SocialNetwork.findAndCountAll({
        limit,
        offset,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: SocialNetworkUser,
            as: 'members',
            attributes: ['user_id'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'surname', 'email']
              }
            ]
          }
        ]
      });

      return res.status(200).json({
        data: rows,
        meta: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          perPage: limit,
        }
      });
    } catch (error) {
        return res.status(500).json({
          error: 'Erro ao buscar redes sociais.',
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
  }

  async indexByUser(req, res) {
    try {
      const page     = Number(req.query.page)      || 1;
      const pageSize = Number(req.query.pageSize)  || 10;
      const limit    = Number(req.query.limit)     || pageSize;
      const offset   = (page - 1) * limit;

      const userNetworks = await SocialNetworkUser.findAll({
        where: { user_id: req.userId },
        attributes: ['social_network_id']
      });
      const networkIds = userNetworks.map(r => r.social_network_id);

      const { count, rows } = await SocialNetwork.findAndCountAll({
        limit,
        offset,
        where: { id: networkIds },
        order: [['created_at', 'DESC']],
        include: [
          {
            model: SocialNetworkUser,
            as: 'members',
            attributes: ['user_id'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['name', 'surname', 'email']
              }
            ]
          }
        ]
      });

      return res.status(200).json({
        data: rows,
        meta: {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          perPage: limit,
        }
      });
    } catch (error) {
        return res.status(500).json({
          error: 'Erro ao buscar redes sociais.',
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
  }

  /**
   * POST /social-networks
   */
  async store(req, res) {
    const schema = Yup.object().shape({
      name:        Yup.string().required('Nome obrigatório'),
      desciption:  Yup.string().nullable()
    });

    try {
      await schema.validate(req.body);

      const exists = await SocialNetwork.findOne({ where: { name: req.body.name } });
      if (exists) {
        return res.status(400).json({ error: 'Rede social já existe com esse nome.' });
      }

      const socialNetwork = await SocialNetwork.create(req.body);

      return res.status(201).json(socialNetwork);
    } catch (error) {
      return res.status(400).json({ error: error.errors ? error.errors[0] : 'Erro na requisição.' });
    }
  }

  /**
   * POST /social-networks-user
   */
  async storeByUser(req, res) {
    const schema = Yup.object().shape({
      name:        Yup.string().required('Nome obrigatório'),
      desciption:  Yup.string().nullable()
    });

    try {
      await schema.validate(req.body);

      const exists = await SocialNetwork.findOne({ where: { name: req.body.name } });
      if (exists) {
        return res.status(400).json({ error: 'Rede social já existe com esse nome.' });
      }

      const socialNetwork = await SocialNetwork.create(req.body);

      const user_id = req.userId;

      await SocialNetworkUser.create({
        social_network_id: socialNetwork.id,
        user_id: user_id
      });

      //preciso associar o id do user logado com a social network criada

      return res.status(201).json(socialNetwork);
    } catch (error) {
      return res.status(400).json({ error: error.errors ? error.errors[0] : 'Erro na requisição.' });
    }
  }

  /**
   * PUT /social-networks/:id
   */
  async update(req, res) {
    const schema = Yup.object().shape({
      name:        Yup.string().required('Nome obrigatório'),
      desciption:  Yup.string().nullable()
    });

    try {
      await schema.validate(req.body);

      const socialNetwork = await SocialNetwork.findByPk(req.params.id);
      if (!socialNetwork) {
        return res.status(404).json({ error: 'Rede social não encontrada.' });
      }

      await socialNetwork.update(req.body);

      return res.json(socialNetwork);
    } catch (error) {
      return res.status(400).json({ error: error.errors ? error.errors[0] : 'Erro na requisição.' });
    }
  }

  /**
   * DELETE /social-networks/:id
   */
  async delete(req, res) {
    try {
      const socialNetwork = await SocialNetwork.findByPk(req.params.id);
      if (!socialNetwork) {
        return res.status(404).json({ error: 'Rede social não encontrada.' });
      }

      await socialNetwork.destroy();

      return res.json({ message: 'Rede social excluída com sucesso.' });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao excluir rede social.' });
    }
  }
}

export default new SocialNetworkController();
