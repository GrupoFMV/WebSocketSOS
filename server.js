const { createServer } = require("http");
const { Server } = require("ws");
const cors = require("cors");
const express = require("express");
const mysql = require("mysql2");

const app = express();
app.use(cors());

const server = createServer(app);
const wss = new Server({ server });

const connection = mysql.createConnection({
  host: "",
  user: "",
  password: "",
  database: "",
});

connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
  } else {
    console.log("Conexão bem-sucedida ao banco de dados.");
  }
});

const insertQuery = "SELECT * FROM os";

connection.query(insertQuery, (error, results) => {
  if (error) {
    console.error("Erro ao inserir no banco de dados:", error);
    return;
  }

  // console.log('Resultados dentro da função de retorno de chamada:', results);

  processResults(results);
});

function processResults(results) {
  // console.log('Resultados fora da função de retorno de chamada:', results);
}

// Armazena todas as conexões WebSocket
const clients = new Set();

wss.on("connection", function connection(ws) {
  // Adiciona a nova conexão WebSocket à coleção
  clients.add(ws);

  ws.on("error", console.error);

  ws.on("message", function message(data) {
    const userData = JSON.parse(data);

    console.log("received: %s", userData.chave);

    if (userData.chave == "teste") {
      console.log('sojun')
      const connection = mysql.createConnection({
        host: "localhost",
        user: "myuser",
        password: "mypassword",
        database: "sos_teste",
      });
      const updateQuery = `
      UPDATE chamados
      SET
        chamado_status = '4',
        chamado_hora_inicio = '2024-01-03 11:41:00.00',
        chamado_hora_final = '2024-01-03 12:41:00.00'
      WHERE
        chamado_os = '75'
    `;

      connection.query(updateQuery, (error, results) => {
        if (error) {
          console.error("Erro ao atualizar no banco de dados:", error);
          return;
        }

        console.log("Registro atualizado com sucesso:", results);
      });
    }

    // Envia a mensagem para todos os clientes conectados
    clients.forEach((client) => {
      // console.log(client.readyState)
      if (client.readyState == 1) {
        client.send(`Server: ${data} eita`);
      }
    });
  });

  ws.on("close", function close() {
    // Remove a conexão WebSocket da coleção quando ela é fechada
    clients.delete(ws);
  });
});

server.listen(8080, () => {
  console.log("Servidor WebSocket rodando na porta 8080");
});
