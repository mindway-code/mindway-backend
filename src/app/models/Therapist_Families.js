import Sequelize, { Model } from 'sequelize';
import Family from './Family';

class TherapistFamilies extends Model {
  static init(sequelize) {
    super.init(
      {
        therapist_id: Sequelize.UUID,
        family_id: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'therapist_families',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Family, { foreignKey: 'family_id', as: 'family' });
    this.belongsTo(models.User, { foreignKey: 'therapist_id', as: 'therapist' });
  }
}

export default TherapistFamilies;
