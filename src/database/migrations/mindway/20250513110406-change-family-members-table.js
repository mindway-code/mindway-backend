'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remover a coluna antiga 'category'
    await queryInterface.removeColumn('family_members', 'therapist_id');

    // Adicionar a nova coluna 'category_id' com referência à tabela 'products_categories'
    await queryInterface.addColumn('family_members', 'therapist_id', {
      type: Sequelize.UUID,
      allowNull: true,
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Se uma categoria for deletada, os produtos ficarão sem categoria
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remover a coluna 'category_id'
    await queryInterface.removeColumn('family_members', 'category_id');

    // Recriar a coluna antiga 'category' (caso precise reverter a migration)
    await queryInterface.addColumn('family_members', 'category_id', {
      type: Sequelize.UUID,
      allowNull: false,
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },
};
