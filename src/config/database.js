// src/config/database.js
// import dotenv from 'dotenv';

// // Carrega as variáveis do .env para process.env
// dotenv.config();


module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'postgres',
  database: 'mindway',
  PORT: 5432,
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
