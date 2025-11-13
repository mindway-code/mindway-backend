import Sequelize, { Model } from 'sequelize';

class Message extends Model {
  static init(sequelize) {
    super.init(
      {
        content: Sequelize.STRING
      },
      {
        sequelize,
        tableName: 'messages',
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.SocialNetwork, { foreignKey: 'social_network_id', as: 'socialNetwork' });
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  }
}

export default Message;
