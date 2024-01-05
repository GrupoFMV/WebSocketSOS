require("dotenv").config();
const mysql = require("mysql2/promise");

const { USUARIO, SENHA, DATABASE, SERVER } = process.env;

async function conexao() {
  try {
    const connection = await mysql.createConnection({
      host: SERVER,
      user: USUARIO,
      password: SENHA,
      database: DATABASE,
    });

    console.log("Conexão bem-sucedida ao banco de dados.");
    return connection;
  } catch (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
    throw err; 
  }
}

module.exports = {
  db: {
    user: USUARIO,
    password: SENHA,
    database: DATABASE,
    host: SERVER,
  },

  conexao,
};
