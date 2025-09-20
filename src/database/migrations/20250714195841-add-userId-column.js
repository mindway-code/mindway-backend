'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    // Adicionar a nova coluna 'category_id' com referência à tabela 'products_categories'
    await queryInterface.addColumn('family_members', 'user_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remover a coluna 'category_id'
    await queryInterface.removeColumn('family_members', 'user_id');

  },
};
