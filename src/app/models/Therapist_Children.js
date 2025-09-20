import Sequelize, { Model } from 'sequelize';

class TherapistChildren extends Model {
  static init(sequelize) {
    super.init(
      {
        therapist_id: Sequelize.UUID,
        child_id: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'therapist_children',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Children, { foreignKey: 'child_id', as: 'child' });
    this.belongsTo(models.User, { foreignKey: 'therapist_id', as: 'therapist' });
  }
}

export default TherapistChildren;
