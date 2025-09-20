'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    // Adicionar a nova coluna 'category_id' com referência à tabela 'products_categories'
    await queryInterface.addColumn('families', 'therapist_id', {
      type: Sequelize.UUID,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remover a coluna 'category_id'
    await queryInterface.removeColumn('families', 'therapist_id');

  },
};
