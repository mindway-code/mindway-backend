import Sequelize, { Model } from 'sequelize';
import databaseConfig from '../config/database.js';
import User from '../app/models/User.js';
import Profile from '../app/models/Profile.js';
import Contact from '../app/models/Contact.js';
import Address from '../app/models/Address.js';
import Family from '../app/models/Family.js';
import FamilyMember from '../app/models/Family_Member.js';
import Children from '../app/models/Children.js';
import TherapistChildren from '../app/models/Therapist_Children.js';
import TherapistFamilies from '../app/models/Therapist_Families.js';
import SocialNetwork from '../app/models/SocialNetwork.js';
import SocialNetworkUser from '../app/models/SocialNetworkUser.js';
import Message from '../app/models/Message.js';
import Appointment from '../app/models/Appointment.js';
import TherapistUser from '../app/models/Therapist_User.js';


const models = [
  User, Address, Contact, Profile, Family, FamilyMember, Children,
  TherapistChildren, TherapistFamilies,
  SocialNetwork, SocialNetworkUser, Message, Appointment, TherapistUser
];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models.map((model) => {
      model.init(this.connection);
    });

    models.map((model) => {
      if (model.associate) {
        model.associate(this.connection.models);
      }
    });
  }
}

export default new Database();
