module.exports = {
  up: async (queryInterface) => {
    return queryInterface.bulkInsert('children', [
      // Família 8
      { name: 'Ana',     surname: 'Gomes',    age: 5,  number: 101, family_id: 8,  created_at: new Date(), updated_at: new Date() },
      { name: 'Lucas',   surname: 'Gomes',    age: 8,  number: 102, family_id: 8,  created_at: new Date(), updated_at: new Date() },

      // Família 9
      { name: 'Paula',   surname: 'Castro',   age: 7,  number: 103, family_id: 9,  created_at: new Date(), updated_at: new Date() },
      { name: 'Bruno',   surname: 'Castro',   age: 10, number: 104, family_id: 9,  created_at: new Date(), updated_at: new Date() },

      // Família 10
      { name: 'Beatriz', surname: 'Oliveira', age: 4,  number: 105, family_id: 10, created_at: new Date(), updated_at: new Date() },
      { name: 'Mateus',  surname: 'Oliveira', age: 9,  number: 106, family_id: 10, created_at: new Date(), updated_at: new Date() },

      // Família 11
      { name: 'Clara',   surname: 'Costa',    age: 6,  number: 107, family_id: 11, created_at: new Date(), updated_at: new Date() },
      { name: 'João',    surname: 'Costa',    age: 11, number: 108, family_id: 11, created_at: new Date(), updated_at: new Date() },

      // Família 12
      { name: 'Fernanda',surname: 'Ferreira', age: 3,  number: 109, family_id: 12, created_at: new Date(), updated_at: new Date() },
      { name: 'Tiago',   surname: 'Ferreira', age: 7,  number: 110, family_id: 12, created_at: new Date(), updated_at: new Date() },

      // Família 13
      { name: 'Juliana', surname: 'Lima',     age: 8,  number: 111, family_id: 13, created_at: new Date(), updated_at: new Date() },
      { name: 'Pedro',   surname: 'Lima',     age: 5,  number: 112, family_id: 13, created_at: new Date(), updated_at: new Date() },

      // Família 14
      { name: 'Rafaela', surname: 'Ramos',    age: 6,  number: 113, family_id: 14, created_at: new Date(), updated_at: new Date() },
      { name: 'Gabriel', surname: 'Ramos',    age: 12, number: 114, family_id: 14, created_at: new Date(), updated_at: new Date() },

      // Família 15
      { name: 'Larissa', surname: 'Machado',  age: 4,  number: 115, family_id: 15, created_at: new Date(), updated_at: new Date() },
      { name: 'Diego',   surname: 'Machado',  age: 9,  number: 116, family_id: 15, created_at: new Date(), updated_at: new Date() },

      // Família 16
      { name: 'Aline',   surname: 'Barbosa',  age: 7,  number: 117, family_id: 16, created_at: new Date(), updated_at: new Date() },
      { name: 'Eduardo', surname: 'Barbosa',  age: 11, number: 118, family_id: 16, created_at: new Date(), updated_at: new Date() },

      // Família 17
      { name: 'Camila',  surname: 'Carvalho', age: 5,  number: 119, family_id: 17, created_at: new Date(), updated_at: new Date() },
      { name: 'Renan',   surname: 'Carvalho', age: 10, number: 120, family_id: 17, created_at: new Date(), updated_at: new Date() },
    ]);
  },

  down: async (queryInterface) => {
    // Remove todas as crianças dos family_id de 8 a 17
    return queryInterface.bulkDelete('children', {
      family_id: { [require('sequelize').Op.between]: [8, 17] }
    });
  },
};
