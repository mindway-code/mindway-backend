import Sequelize, { Model } from 'sequelize';

class Appointment extends Model {
  static init(sequelize) {
    super.init(
      {
        patient_id: Sequelize.UUID,
        provider_id: Sequelize.UUID,
        date: Sequelize.DATEONLY,
        time: Sequelize.TIME,
        status: Sequelize.STRING,
        note: Sequelize.STRING
      },
      {
        sequelize,
        tableName: 'appointments',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider' });
    this.belongsTo(models.User, { foreignKey: 'patient_id', as: 'patient' });
  }
}

export default Appointment;
