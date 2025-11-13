import Sequelize, { Model } from 'sequelize';
import databaseConfig from '../config/database';
import User from '../app/models/User';
import Profile from '../app/models/Profile';
import Contact from '../app/models/Contact';
import Address from '../app/models/Address';
import Family from '../app/models/Family';
import FamilyMember from '../app/models/Family_Member';
import Children from '../app/models/Children';
import TherapistChildren from '../app/models/Therapist_Children';
import TherapistFamilies from '../app/models/Therapist_Families';
import SocialNetwork from '../app/models/SocialNetwork';
import SocialNetworkUser from '../app/models/SocialNetworkUser';
import Message from '../app/models/Message';
import Appointment from '../app/models/Appointment';
import TherapistUser from '../app/models/Therapist_User';

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
