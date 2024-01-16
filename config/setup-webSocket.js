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
        case "concluirAtendimento":
          response = await controllers.concluirAtendimento(userData.idChamado);
          break;

        case "IniciarAtendimento":
          response = await controllers.IniciarAtendimento(userData.idChamado);
          break;

        case "AtendimentoImpedido":
          response = await controllers.AtendimentoImpedido(userData.idChamado);
          break;

        case "CancelarAtendimento":
          response = await controllers.CancelarAtendimento(userData.idChamado);
          break;

        case "Orcamento":
          response = await controllers.Orcamento(userData.idChamado);
          break;

        case "iniciarDeslocamento":
          response = await controllers.IniciarDeslocamento(userData.tecnico, userData.idChamado);
          break;

        case "finalizarDeslocamento":
          response = await controllers.FinalizarDeslocamento(userData.idDeslocamento);
          break;

        case "iniciarDescanso":
          response = await controllers.IniciarDescanso(userData.idTecnico);
          break;

        case "FinalizarDescanso":
          response = await controllers.FinalizarDescanso(userData.idDescanso);
          break;

        case "IniciarAtendimentoComDeslocamento":
          response = await controllers.IniciarAtendimentoComDeslocamento(userData.idChamado, userData.idEvento)
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
