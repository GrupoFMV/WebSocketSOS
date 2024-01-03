// const { createServer } = require('http');
// const { Server } = require('ws');
// const cors = require('cors');
// const express = require('express');

// const app = express();
// app.use(cors());

// const server = createServer(app);
// const wss = new Server({ server });

// wss.on('connection', function connection(ws) {
//   ws.on('error', console.error);

//   ws.on('message', function message(data) {
//     console.log('received: %s', data);


//     ws.send(`Server: ${data} eita`);
//   });
// });




// server.listen(8080, () => {
//   console.log('Servidor WebSocket rodando na porta 8080');
// });


const { createServer } = require('http');
const { Server } = require('ws');
const cors = require('cors');
const express = require('express');

const app = express();
app.use(cors());

const server = createServer(app);
const wss = new Server({ server });

// Armazena todas as conexões WebSocket
const clients = new Set();

wss.on('connection', function connection(ws) {
  // Adiciona a nova conexão WebSocket à coleção
  clients.add(ws);

  ws.on('error', console.error);

  ws.on('message', function message(data) {
    console.log('received: %s', data);

    // Envia a mensagem para todos os clientes conectados
    clients.forEach(client => {
        // console.log(client.readyState)
      if (client.readyState == 1) {
        client.send(`Server: ${data} eita`);
      }
    });
  });

  ws.on('close', function close() {
    // Remove a conexão WebSocket da coleção quando ela é fechada
    clients.delete(ws);
  });
});

server.listen(8080, () => {
  console.log('Servidor WebSocket rodando na porta 8080');
});

