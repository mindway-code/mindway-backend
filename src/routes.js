import { Router } from 'express';

import authMiddleware from './app/middlewares/auth';
import authAdmin from './app/middlewares/authAdmin';

import UserController from './app/controllers/UserController';
import ProfileController from './app/controllers/ProfileController';
import ContactController from './app/controllers/ContactController';
import AddressController from './app/controllers/AddressController';
import SessionController from './app/controllers/SessionController';
import passport from './config/clientGoogle';
import FamilyController from './app/controllers/FamilyController';
import FamilyMemberController from './app/controllers/FamilyMemberController';
import ChildrenController from './app/controllers/ChildrenController';
import authTherapist from './app/middlewares/authTherapist';
import TherapistFamiliesController from './app/controllers/TherapistFamiliesController';
import TherapistChildrenController from './app/controllers/TherapistChildrenController';
const routes = new Router();

routes.post('/register', UserController.store);
routes.get('/users', UserController.index);
//routes.post('/usersBy', UserController.userShowBy);
// routes.get('/user_Google/me', UserController.indexGoogle);
// passo 1 – inicia fluxo OAuth
routes.get('/user_Google', passport.authenticate('google', { scope: ['profile', 'email'] }),);
// 2) Rota de callback para onde o Google redireciona
routes.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  UserController.indexGoogle
);


routes.post('/login', SessionController.store);


// Todas rotas abaixo desse middleware precisa estar autenticado
routes.use(authMiddleware);
// ======================= Families ==================
routes.post('/families', FamilyController.store);
routes.put('/families/:id', FamilyController.update);
routes.get('/families', FamilyController.index);
routes.delete('/families/:id', FamilyController.delete);

// ======================= Family Members ==================
routes.post('/family-members',  FamilyMemberController.store);
routes.put ('/family-members/:id', FamilyMemberController.update);
routes.get ('/family-members',  FamilyMemberController.index);
routes.delete('/family-members/:id', FamilyMemberController.delete);

// ======================= Therapist Families ==================
routes.get('/therapist-families', TherapistFamiliesController.index);
routes.get('/therapist-families/user', TherapistFamiliesController.indexByReqUser);
routes.post('/therapist-families', TherapistFamiliesController.store);
routes.put('/therapist-families/:id', TherapistFamiliesController.update);
routes.delete('/therapist-families/:id', TherapistFamiliesController.delete);

// ======================= Therapist Children ==================
routes.get('/therapist-children', TherapistChildrenController.index);
routes.get('/therapist-children/user', TherapistChildrenController.indexByReqUser);
routes.post('/therapist-children', TherapistChildrenController.store);
routes.put('/therapist-children/:id', TherapistChildrenController.update);
routes.delete('/therapist-children/:id', TherapistChildrenController.delete);

// ======================= Children ==================
routes.post('/children',  ChildrenController.store);
routes.put ('/children/:id', ChildrenController.update);
routes.get ('/children',  ChildrenController.index);
routes.delete('/children/:id', ChildrenController.delete);

// ==================== Session ====================
routes.delete('/sessions', SessionController.logout);
routes.get('/sessions/validate', SessionController.validateSession);

// ==================== USERS ====================
routes.get('/users', UserController.index);
routes.put('/users/:id', UserController.updateData);
routes.get('/users/:id', UserController.getUserById);
routes.delete('/users/:id', UserController.deleteTransaction);

// ==================== PROFILES ====================
routes.get('/profiles', ProfileController.index);
routes.post('/profiles', ProfileController.store);
routes.put('/profiles/:id', ProfileController.update);
routes.delete('/profiles/:id', ProfileController.delete);

// ==================== CONTACTS ====================
routes.get('/contacts', ContactController.index);
routes.post('/contacts', ContactController.store);
routes.put('/contacts/:id', ContactController.update);
routes.delete('/contacts/:id', ContactController.delete);

// ==================== ADDRESSES ====================
routes.get('/addresses', AddressController.index);
routes.post('/addresses', AddressController.store);
routes.put('/addresses/:id', AddressController.update);
routes.delete('/addresses/:id', AddressController.delete);

// ==================== AUTH GUARD ====================
routes.get('/auth/therapist', authTherapist, (req, res) => {
  return res.status(200).json({ message: 'Acesso autorizado para terapeuta.' });
});


export default routes;
