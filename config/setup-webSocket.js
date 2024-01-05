const { Server } = require("ws");
const controllers = require("../app/Controllers/controller");
const clients = new Set();
let wss;

function initWebSocket(server) {
  wss = new Server({ server });

  wss.on("connection", function connection(ws) {
    clients.add(ws);

    ws.on("error", console.error);

    ws.on("message", async function message(data) {
      const userData = JSON.parse(data);

      let response = null;

      switch (userData.chave) {
        case "iniciarChamado":
          response = await controllers.IniciarATendimento();
          break;

        case "finalizarChamado":
          response = controllers.IniciarATendimento();
          break;

        case "finalizarChamado":
          response = controllers.IniciarATendimento();
          break;

        case "finalizarChamado":
          response = controllers.IniciarATendimento();
          break;
        default:
          break;
      }

      clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify(response));
        }
      });
    });

    ws.on("close", function close() {
      clients.delete(ws);
    });
  });
}

function getWebSocket() {
  return wss;
}

module.exports = {
  initWebSocket,
  getWebSocket,
};
