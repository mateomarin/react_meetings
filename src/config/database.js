module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'docker',
  database: 'meetapp',
  define: {
    timestamps: true, // automaticamente gera o created_at updated_at
    underscored: true, // para evitar padrão camel case
    underscoredAll: true,
  },
};
