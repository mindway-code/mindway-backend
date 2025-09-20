'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('family_members', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      family_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      therapist_id: {
        type: Sequelize.UUID, //therapist_id recebe o user_id do user com profile = 3
        allowNull: false,
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('family_members');
  }
};
