import Sequelize, { Model } from 'sequelize';

class Family extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'families',
      }
    );
    return this;
  }

  static associate(models) {
    this.hasMany(models.FamilyMember, { foreignKey: 'family_id', as: 'members' });
    this.hasMany(models.Children, { foreignKey: 'family_id', as: 'children' });
  }
}

export default Family;
