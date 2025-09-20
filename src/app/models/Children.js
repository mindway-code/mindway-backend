import Sequelize, { Model } from 'sequelize';

class Children extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        surname: Sequelize.STRING,
        age: Sequelize.INTEGER,
        number: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'children',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Family, { foreignKey: 'family_id', as: 'family' });
  }
}

export default Children;
