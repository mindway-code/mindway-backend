'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('appointments', 'user_id');
    await queryInterface.removeColumn('appointments', 'provider_id');

    await queryInterface.addColumn('appointments', 'user_id', {
      type: Sequelize.UUID,
      allowNull: false,
      // references: { model: 'users', key: 'id' },
    });
    await queryInterface.addColumn('appointments', 'provider_id', {
      type: Sequelize.UUID,
      allowNull: false,
      // references: { model: 'users', key: 'id' },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('appointments', 'user_id');
    await queryInterface.removeColumn('appointments', 'provider_id');

    await queryInterface.addColumn('appointments', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.addColumn('appointments', 'provider_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};
