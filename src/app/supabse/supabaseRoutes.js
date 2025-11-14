import { Router } from 'express';

import UserSupabaseController from './controllers/UserSupabase.js';
import authSupabase from './middlewares/authSupabase.js';
import SessionSupabaseController from './controllers/SessionSupabase.js';
import SocialNetworkSupabaseController from './controllers/SocialNetworkSupabase.js';
import SocialNetworkUserSupabaseController from './controllers/SocialNetworkUserSupabase.js';
import { supabase } from '../../database/indexSupabase.js';
import MessageSupabaseController from './controllers/MessageSupabase.js';
import AppointmentSupabaseController from './controllers/AppointmentSupabase.js';
import TherapistUserSupabaseController from './controllers/TherapistUserSupabase.js';


const routesSupabase = new Router();



//================ SessionSupabase =================
routesSupabase.post('/login', SessionSupabaseController.store);

//================== UserSupabase ======================
routesSupabase.post('/register', UserSupabaseController.store);
routesSupabase.get('/users', authSupabase, UserSupabaseController.index);
routesSupabase.get('/users/:id', authSupabase, UserSupabaseController.getUserById);
routesSupabase.put('/users/:id', authSupabase, UserSupabaseController.updateData);
routesSupabase.delete('/users/:id', authSupabase, UserSupabaseController.deleteTransaction);

//================== SocialNetwork ======================
routesSupabase.post('/social-networks', authSupabase, SocialNetworkSupabaseController.store);
routesSupabase.get('/social-networks/user', authSupabase, SocialNetworkSupabaseController.indexByUser);
routesSupabase.post('/social-networks/user', authSupabase, SocialNetworkSupabaseController.storeByUser);
routesSupabase.put('/social-networks/:id', authSupabase, SocialNetworkSupabaseController.update);
routesSupabase.delete('/social-networks/:id', authSupabase, SocialNetworkSupabaseController.delete);

//================== SocialNetworkUser ======================
routesSupabase.get('/social-network-user', authSupabase, SocialNetworkUserSupabaseController.index);
routesSupabase.post('/social-network-user', authSupabase, SocialNetworkUserSupabaseController.store);
routesSupabase.delete('/social-network-user/:id', authSupabase, SocialNetworkUserSupabaseController.delete);

//================== Message ======================
routesSupabase.get('/messages', authSupabase, MessageSupabaseController.index);
routesSupabase.post('/messages', authSupabase, MessageSupabaseController.store);
routesSupabase.delete('/messages/:id', authSupabase, MessageSupabaseController.delete);

//================== Appointment ======================
routesSupabase.get('/appointments/patient', authSupabase, AppointmentSupabaseController.indexByPatient);
routesSupabase.get('/appointments/therapist', authSupabase, AppointmentSupabaseController.indexByTherapist);
routesSupabase.get('/appointments/therapist-date', authSupabase, AppointmentSupabaseController.indexByTherapistAndDate );
routesSupabase.get('/appointments/date', authSupabase, AppointmentSupabaseController.indexByDate);
routesSupabase.post('/appointments/create', authSupabase, AppointmentSupabaseController.store);
routesSupabase.put('/appointments/:id', authSupabase, AppointmentSupabaseController.update);
routesSupabase.delete('/appointments/:id', authSupabase, AppointmentSupabaseController.delete);

//================== TherapistUser ======================
routesSupabase.get('/therapist-users/associated', authSupabase, TherapistUserSupabaseController.indexAssociated);
routesSupabase.post('/therapist-users', authSupabase, TherapistUserSupabaseController.store);
routesSupabase.put('/therapist-users/:id', authSupabase, TherapistUserSupabaseController.update);
routesSupabase.delete('/therapist-users/:id', authSupabase, TherapistUserSupabaseController.delete);


//================== getMe ======================
routesSupabase.get('/me', authSupabase, async (req, res) => {
  try {

    const userId = req.userIdSupabase;

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, name, surname, email,
        profile:profiles(id, name),
        contact:contacts(id, telephone, smartphone),
        address:addresses(address_name, country, state, city, cep)
      `)
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        error: 'Erro ao buscar usuário.',
        details: error.message,
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    return res.json(user);

  } catch (error) {
    return res.status(500).json({
      error: 'Erro interno.',
      details: error.message,
    });
  }
});


export default routesSupabase;
