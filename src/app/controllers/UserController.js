import * as Yup from 'yup';

import User from '../models/User.js';
import Contact from '../models/Contact.js';
import Address from '../models/Address.js';
import Profile from '../models/Profile.js';

import { Op } from 'sequelize';
import sequelize from '../../config/sequelize.js';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs/dist/bcrypt.js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

class UserController {
  async index(req, res) {
    try {

      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;

      const offset = (page - 1)*pageSize;

      let where = {};
      if (req.query.name && req.query.name.trim() !== '') {
        where = {
          ...where,
          name: { [Op.iLike]: `%${req.query.name.trim()}%` }
        };
      }

      const { count, rows: users } = await User.findAndCountAll({
        attributes: ['id', 'name', 'surname', 'email'],
        where,
        include: [
          {
            model: Profile,
            as: 'profile',
            attributes: ['id', 'name']
          },
          {
            model: Contact,
            as: 'contact',
            attributes: ['id', 'telephone', 'smartphone']
          },
          // {
          //   model: Address,
          //   as: 'address',
          //   attributes: ['address_name', 'country', 'state', 'city', 'cep']
          // }

        ],
        limit: pageSize,
        offset: offset,
      });


      return res.json({
        totalPages: Math.ceil(count / pageSize),
        currentPage: page,
        pageSize: pageSize,
        totalUsers: count,
        users,
      });

    } catch (error) {
      return res.status(500).json({
        error: 'Erro ao buscar usuários.',
        details: error.message
      });
    }
  }

  async indexGoogle(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Não autenticado' });
      }
      const userGoogle = req.user;
      const securePassword = uuidv4();
      const password = bcrypt.hashSync(securePassword, 10);


      const userExists = await User.findOne({ where: {email: userGoogle.email}});
      if (!userExists) {

        userGoogle = await User.create ({
          name: userGoogle.name,
          email: userGoogle.email,
          surname: '',
          password_hash: password,
          profile_id: 1,
        });
        console.log('Usuário não encontrado, criando novo usuário:', userGoogle);

        return res.redirect('http://localhost:4207');
      }
        return res.redirect('http://localhost:4207');
    }
    catch (err) {
      console.error(err);
      return res.status(500).json({error: 'Erro ao processar autenticação Google'});
    }
  }

  async store(req, res) {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        surname: Yup.string().required(),
        email: Yup.string().email().required(),
        password: Yup.string().required().min(6),
        confirmPassword: Yup.string()
          .required()
          .oneOf([Yup.ref('password')], 'As senhas não coincidem'),
      });

      if (!(await schema.isValid(req.body))) {
        return res.status(400).json({ error: 'Validação falhou' });
      }

      const userExists = await User.findOne({ where: { email: req.body.email } });

      if (userExists) {
        return res.status(400).json({ error: 'Usuário já existe' });
      }

      const user = await User.create({
        ...req.body,
        profile_id: 1,
      });

      // Opcional: recarregar usuário com associações se necessário
      await User.findByPk(user.id, {
        include: [
          {
            association: 'profile',
            attributes: ['id', 'name']
          },
          {
            association: 'address',
            attributes: ['id', 'address_name', 'country', 'state', 'city', 'cep']
          },
          {
            association: 'contact',
            attributes: ['id', 'telephone', 'smartphone']
          },
        ]
      });

      const checkUser = await User.findOne({ where: { email: user.email } });

      if (!checkUser) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      if (!(await checkUser.checkPassword(password))) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      const { id, name, surname, profile_id } = checkUser;

      const token = jwt.sign({ id, profile_id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      });

      return res.json({
        user: { id, name, surname, email, profile_id },
        token,
      });

    }
    catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao criar usuário.' });
    }
  }


  async updateData(req, res){
    const {
      name, surname, email, oldPassword,
      password, confirmPassword,contact,
      address,  profile
    } = req.body;

    try {


      // Busca a solicitação com as associações necessárias
      const userExists = await User.findByPk(req.userId, {
        include: [
          { model: Contact, as: 'contact' },
          { model: Address, as: 'address' },
          { model: Profile, as: 'profile' },
        ]
      });

      if (!userExists) {
        return res.status(404).json({ message: 'user não encontrado.' });
      }

      if (email && email !== userExists.email) {
        const userEmail = await User.findOne({ where: { email } });
        if (userEmail) {
          return res.status(400).json({ error: 'Email já cadastrado' });
        }
      }

      // Valida a senha, se o oldPassword for informado
      if (oldPassword) {
        if (!password) {
          return res.status(400).json({ error: 'Nova senha é obrigatória quando a senha antiga é informada' });
        }
        if (password.length < 6) {
          return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres' });
        }
        if (!confirmPassword) {
          return res.status(400).json({ error: 'Confirmação de senha é obrigatória' });
        }
        if (password !== confirmPassword) {
          return res.status(400).json({ error: 'A confirmação da senha não confere' });
        }
        if (!(await userExists.checkPassword(oldPassword))) {
          return res.status(401).json({ error: 'Senha antiga incorreta' });
        }
      }

      const userUpdate = {
        ...(name && { name }),
        ...(surname && { surname }),
        ...(email && { email }),
        ...(oldPassword && { password }), // Se oldPassword for informado, atualiza a senha com o novo valor.
      };

      await userExists.update(userUpdate);

      // Atualiza os modelos associados, se os dados estiverem presentes

      if (contact) {
        if (userExists.contact) {
          // Atualiza o contato existente
          await userExists.contact.update(contact);
        } else {
          // Cria o contato e associa ao usuário
          await userExists.createContact(contact);
        }
      }

      if (address) {
        if (userExists.address) {
          await userExists.address.update(address);
        } else {
          await userExists.createAddress(address);
        }
      }


      if (profile) {
        if (userExists.profile) {
          await userExists.profile.update(profile);
        } else {
          await userExists.createProfile(profile);
        }
      }

      return res.json({
        id: userExists.id,
        name: userExists.name,
        surname: userExists.surname,
        email: userExists.email,
        profile: userExists.profile,
        address: userExists.address,
        contact: userExists.contact,
    });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro ao atualizar user.' });
    }

  }

  async getUserById(req, res) {
    try {
      const user = await User.findByPk(req.params.id, {
        include: [
          {
            model: Profile,
            as: 'address',
            attributes: ['id', 'name']
          },
          {
            model: Contact,
            as: 'address',
            attributes: ['id', 'telephone', 'smartphone']
          },
          {
            model: Address,
            as: 'address',
            attributes: ['address_name', 'country', 'state', 'city', 'cep']
          }
        ],
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      return res.json({
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        profile: user.profile,
        address: user.address,
        contact: user.contact,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }

  // async delete(req, res) {
  //   try {
  //     const user = await User.findByPk(req.params.id);

  //     if (!user) {
  //       return res.status(404).json({ error: 'Usuário não encontrado' });
  //     }

  //     if(user.address) await user.address.destroy();
  //     if(user.contact) await user.contact.destroy();
  //     await user.destroy();

  //     return res.status(200).json({ message: 'Usuário deletado com sucesso' });
  //   } catch (error) {
  //     return res.status(500).json({ error: 'Erro ao deletar usuário' });
  //   }
  // }

  async deleteTransaction(req, res) {
    const t = await sequelize.transaction();

    try {
      const user = await User.findByPk(req.params.id, {
        include: [
          { association: 'address' },
          { association: 'contact' },
        ],
        transaction: t,
      });

      if(!user) return res.status(404).json({error: 'Usuário não encontrado'});

      if(user.address) {await user.address.destroy({transaction: t});}

      if(user.contact) {await user.contact.destroy({transaction: t});}

      await user.destroy({ transaction: t });

      await t.commit();

    return res.status(200).json({ message: 'Usuário e suas associações deletados com sucesso.' });
    }
    catch (error) {
      await t.rollback();
      console.error(error);
      return res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
  }
}

export default new UserController();
