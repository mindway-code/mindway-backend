import Sequelize, { Model } from 'sequelize';

class SocialNetworkUser extends Model {
  static init(sequelize) {
    super.init(
      {
      },
      {
        sequelize,
        tableName: 'social_network_user',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.SocialNetwork, { foreignKey: 'social_network_id', as: 'socialNetwork' });
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  }
}

export default SocialNetworkUser;
