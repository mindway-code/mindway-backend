module.exports = {
  up: async (queryInterface) => {
    return queryInterface.bulkInsert('social_network_user', [
      // --- Rede de Apoio Profissional (id=3) ---
      {
        social_network_id: 3,
        user_id: 'c63c0919-3fc8-48cb-adc4-f9c572005998',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        social_network_id: 3,
        user_id: '4daee128-1f91-46cd-a1f0-9c9b61aa0e4e',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        social_network_id: 3,
        user_id: '4de69849-f388-40c5-a55b-d7eb1533875b',
        created_at: new Date(),
        updated_at: new Date()
      },

      // --- Rede de Apoio Familiar (id=2) ---
      {
        social_network_id: 2,
        user_id: 'c63c0919-3fc8-48cb-adc4-f9c572005998',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        social_network_id: 2,
        user_id: '4daee128-1f91-46cd-a1f0-9c9b61aa0e4e',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface) => {
    return queryInterface.bulkDelete('social_network_user', null, {});
  },
};
