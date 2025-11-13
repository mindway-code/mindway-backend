module.exports = {
  up: async (queryInterface) => {
    return queryInterface.bulkInsert('families', [
      { name: 'Albani',    created_at: new Date(), updated_at: new Date() },
      { name: 'Gomes',     created_at: new Date(), updated_at: new Date() },
      { name: 'Castro',    created_at: new Date(), updated_at: new Date() },
      { name: 'Oliveira',  created_at: new Date(), updated_at: new Date() },
      { name: 'Costa',     created_at: new Date(), updated_at: new Date() },
      { name: 'Ferreira',  created_at: new Date(), updated_at: new Date() },
      { name: 'Lima',      created_at: new Date(), updated_at: new Date() },
      { name: 'Ramos',     created_at: new Date(), updated_at: new Date() },
      { name: 'Machado',   created_at: new Date(), updated_at: new Date() },
      { name: 'Barbosa',   created_at: new Date(), updated_at: new Date() },
      { name: 'Carvalho',  created_at: new Date(), updated_at: new Date() },
      // pode adicionar mais famílias aqui, sempre sem o id
    ]);
  },

  down: async (queryInterface) => {
    // O ideal é apagar só os nomes inseridos para não deletar registros de outros seeds
    return queryInterface.bulkDelete('families', {
      name: [
        'Albani', 'Gomes', 'Castro', 'Oliveira', 'Costa',
        'Ferreira', 'Lima', 'Ramos', 'Machado', 'Barbosa', 'Carvalho'
      ]
    });
  },
};
