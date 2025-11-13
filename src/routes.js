import { Router } from 'express';

import authMiddleware from './app/middlewares/auth.js';

import UserController from './app/controllers/UserController.js';
import ProfileController from './app/controllers/ProfileController.js';
import ContactController from './app/controllers/ContactController.js';
import AddressController from './app/controllers/AddressController.js';
import SessionController from './app/controllers/SessionController.js';
import passport from './config/clientGoogle.js';
import FamilyController from './app/controllers/FamilyController.js';
import FamilyMemberController from './app/controllers/FamilyMemberController.js';
import ChildrenController from './app/controllers/ChildrenController.js';
import authTherapist from './app/middlewares/authTherapist.js';
import TherapistFamiliesController from './app/controllers/TherapistFamiliesController.js';
import TherapistChildrenController from './app/controllers/TherapistChildrenController.js';
import MessageController from './app/controllers/MessageController.js';
import SocialNetworkController from './app/controllers/SocialNetworkController.js';
import SocialNetworkUserController from './app/controllers/SocialNetworkUserController.js';
import User from './app/models/User.js';
import Address from './app/models/Address.js';
import Contact from './app/models/Contact.js';
import AppointmentController from './app/controllers/AppointmentController.js';
import TherapistUserController from './app/controllers/TherapistUserController.js';


const routes = new Router();


// ======================= Users ==================
routes.post('/register', UserController.store);

// ======================= authGoogle ==================
routes.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  UserController.indexGoogle
);

// ================= Sessions ==================
routes.post('/login', SessionController.store);


// ======================= getMe ==================
routes.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findByPk(req.userId, {
    attributes: ['id', 'name', 'surname', 'email', 'profile_id'],
    include: [
      {
        model: Address,
        as: 'address',
        attributes: ['address_name', 'country', 'state', 'city', 'cep']
      },
      {
        model: Contact,
        as: 'contact',
        attributes: ['id', 'telephone', 'smartphone']
      },
    ]

  });
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }
  return res.status(200).json(user);
});

// ======================= Appointments ==================
routes.use('/appointments', authMiddleware);

routes.get('/appointments/index', AppointmentController.index);
routes.get('/appointments/patient', AppointmentController.indexByPatient);
routes.get('/appointments/therapist', AppointmentController.indexByTherapist);
routes.get('/appointments/therapist-date', AppointmentController.indexByTherapistAndDate);
routes.get('/appointments/date', AppointmentController.indexByDate);
routes.post('/appointments/create', AppointmentController.store);
routes.put('/appointments/:id', AppointmentController.update);
routes.delete('/appointments/:id', AppointmentController.delete);


// ======================= SocialNetworks ==================
routes.use('/social-networks', authMiddleware);

routes.get('/social-networks', SocialNetworkController.index);
routes.get('/social-networks/user', SocialNetworkController.indexByUser);
routes.post('/social-networks', SocialNetworkController.store);
routes.post('/social-networks/user', SocialNetworkController.storeByUser);
routes.put('/social-networks/:id', SocialNetworkController.update);
routes.delete('/social-networks/:id', SocialNetworkController.delete);

// ======================= SocialNetworkUsers ==================
routes.use('/social-networks-users', authMiddleware);


routes.get('/social-network-users', SocialNetworkUserController.index);
routes.post('/social-network-users', SocialNetworkUserController.store);
routes.delete('/social-network-users/:id', SocialNetworkUserController.delete);

// ======================= Messages ==================
routes.use('/messages', authMiddleware);


routes.get('/messages', MessageController.index);
routes.post('/messages', MessageController.store);
routes.delete('/messages/:id', MessageController.delete);

// ======================= Families ==================
routes.use('/families', authMiddleware);


routes.post('/families', FamilyController.store);
routes.put('/families/:id', FamilyController.update);
routes.get('/families', FamilyController.index);
routes.delete('/families/:id', FamilyController.delete);

// ======================= Family Members ==================
routes.use('/family-members', authMiddleware);


routes.post('/family-members',  FamilyMemberController.store);
routes.put ('/family-members/:id', FamilyMemberController.update);
routes.get ('/family-members',  FamilyMemberController.index);
routes.delete('/family-members/:id', FamilyMemberController.delete);

// ======================= Therapist Families ==================
routes.use('/therapist-families', authMiddleware);


routes.get('/therapist-families', TherapistFamiliesController.index);
routes.get('/therapist-families/user', TherapistFamiliesController.indexByReqUser);
routes.post('/therapist-families', TherapistFamiliesController.store);
routes.put('/therapist-families/:id', TherapistFamiliesController.update);
routes.delete('/therapist-families/:id', TherapistFamiliesController.delete);

// ======================= Therapist Children ==================
routes.use('/therapist-children', authMiddleware);

routes.get('/therapist-children', TherapistChildrenController.index);
routes.get('/therapist-children/user', TherapistChildrenController.indexByReqUser);
routes.post('/therapist-children', TherapistChildrenController.store);
routes.put('/therapist-children/:id', TherapistChildrenController.update);
routes.delete('/therapist-children/:id', TherapistChildrenController.delete);

// ======================= Therapist Families ==================
routes.use('/therapist-users', authMiddleware);

routes.get('/therapist-users/associated', TherapistUserController.indexAssociated);


// ======================= Children ==================
routes.use('/children', authMiddleware);

routes.post('/children',  ChildrenController.store);
routes.put ('/children/:id', ChildrenController.update);
routes.get ('/children',  ChildrenController.index);
routes.delete('/children/:id', ChildrenController.delete);

// ==================== Session ====================
routes.use('/sessions', authMiddleware);

routes.delete('/sessions', SessionController.logout);
routes.get('/sessions/validate', SessionController.validateSession);

// ==================== USERS ====================
routes.use('/users', authMiddleware);

routes.get('/users', UserController.index);
routes.put('/users/:id', UserController.updateData);
routes.get('/users/:id', UserController.getUserById);
routes.delete('/users/:id', UserController.deleteTransaction);

// ==================== PROFILES ====================
routes.use('/profiles', authMiddleware);

routes.get('/profiles', ProfileController.index);
routes.post('/profiles', ProfileController.store);
routes.put('/profiles/:id', ProfileController.update);
routes.delete('/profiles/:id', ProfileController.delete);

// ==================== CONTACTS ====================
routes.use('/contacts', authMiddleware);

routes.get('/contacts', ContactController.index);
routes.post('/contacts', ContactController.store);
routes.put('/contacts/:id', ContactController.update);
routes.delete('/contacts/:id', ContactController.delete);

// ==================== ADDRESSES ====================
routes.use('/addresses', authMiddleware);

routes.get('/addresses', AddressController.index);
routes.post('/addresses', AddressController.store);
routes.put('/addresses/:id', AddressController.update);
routes.delete('/addresses/:id', AddressController.delete);

// ==================== AUTH GUARD ====================
routes.get('/auth/therapist', authTherapist, (req, res) => {
  return res.status(200).json({ message: 'Acesso autorizado para terapeuta.' });
});


export default routes;
