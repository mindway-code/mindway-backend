import Sequelize, { Model } from 'sequelize';

class FamilyMember extends Model {
  static init(sequelize) {
    super.init(
      {
        family_id: Sequelize.INTEGER,
        role: Sequelize.STRING,
        user_id: Sequelize.UUID,
      },
      {
        sequelize,
        tableName: 'family_members',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Family, { foreignKey: 'family_id', as: 'family' });
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'member' });
  }
}

export default FamilyMember;
