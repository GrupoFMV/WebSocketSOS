const { createServer } = require("http");
const cors = require("cors");
const express = require("express");
const { initWebSocket } = require("./config/setup-webSocket");

const app = express();

app.use(cors());

const server = createServer(app);

initWebSocket(server);

server.listen(8080, () => {
  console.log("Servidor WebSocket rodando na porta 8080");
});

module.exports = { server };