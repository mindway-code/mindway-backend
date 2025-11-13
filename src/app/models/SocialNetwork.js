import Sequelize, { Model } from 'sequelize';

class SocialNetwork extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        description: Sequelize.STRING
      },
      {
        sequelize,
        tableName: 'social_network',
      }
    );
    return this;
  }

  static associate(models) {
    this.hasMany(models.SocialNetworkUser, { foreignKey: 'social_network_id', as: 'members' });
    this.hasMany(models.Message, { foreignKey: 'social_network_id', as: 'messages' });
  }
}

export default SocialNetwork;
