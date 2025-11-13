module.exports = {
  up: async (queryInterface) => {
    return queryInterface.bulkInsert('social_network', [
      {
        name: 'Rede de Apoio Escolar',
        description: 'Espaço para alunos, professores, pais e psicólogos debaterem estratégias, desafios e soluções voltadas ao desenvolvimento emocional e aprendizagem no ambiente escolar.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Rede de Apoio Familiar',
        description: 'Grupo de suporte a famílias em processos terapêuticos, promovendo integração, troca de experiências e orientações sobre saúde mental em casa.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Rede de Apoio Profissional',
        description: 'Comunidade para psicólogos, terapeutas e demais profissionais trocarem conhecimento, discutirem casos e fortalecerem a atuação em conjunto.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Rede de Orientação para Educadores',
        description: 'Rede de colaboração entre educadores e profissionais de saúde mental para aprimorar práticas de acolhimento e suporte aos alunos.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Rede de Integração Família-Escola',
        description: 'Plataforma de comunicação entre famílias e escolas, mediada por psicólogos, para fortalecer o acompanhamento emocional e acadêmico dos estudantes.',
        created_at: new Date(),
        updated_at: new Date()
      },
    ]);
  },

  down: async (queryInterface) => {
    return queryInterface.bulkDelete('social_network', null, {});
  },
};

