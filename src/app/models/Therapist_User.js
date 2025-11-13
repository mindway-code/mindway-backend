import Sequelize, { Model } from 'sequelize';

class TherapistUser extends Model {
  static init(sequelize) {
    super.init(
      {
        therapist_id: Sequelize.UUID,
        user_id: Sequelize.UUID,
      },
      {
        sequelize,
        tableName: 'therapist_user',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.User, { foreignKey: 'therapist_id', as: 'therapist' });
  }
}

export default TherapistUser;
