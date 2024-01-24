const services = require("../Services/Processos");
const filterOrders = require("../Services/filterOrders");
module.exports = {
  async concluirAtendimento(idChamado) {
    await services.concluirAtendimento(idChamado)

    const ordensDirecionadas = await filterOrders.buscarOrdensDirecionadas();
    const tecnicos = await filterOrders.buscarUsers();

    const data = {
      ordens: ordensDirecionadas,
      tecnicos: tecnicos,
    };

    return data;
  },

  async IniciarAtendimento(idChamado) {
    await services.IniciarAtendimento(idChamado);

    const ordensDirecionadas = await filterOrders.buscarOrdensDirecionadas();
    const tecnicos = await filterOrders.buscarUsers();

    const data = {
      ordens: ordensDirecionadas,
      tecnicos: tecnicos,
    };

    return data;
  },

  async CancelarAtendimento(idChamado) {
    await services.CancelarAtendimento(idChamado);

    const ordensDirecionadas = await filterOrders.buscarOrdensDirecionadas();
    const tecnicos = await filterOrders.buscarUsers();

    const data = {
      ordens: ordensDirecionadas,
      tecnicos: tecnicos,
    };

    return data;
  },

  async AtendimentoImpedido(idChamado) {
    await services.AtendimentoImpedido(idChamado);

    const ordensDirecionadas = await filterOrders.buscarOrdensDirecionadas();
    const tecnicos = await filterOrders.buscarUsers();

    const data = {
      ordens: ordensDirecionadas,
      tecnicos: tecnicos,
    };

    return data;
  },

  async Orcamento(idChamado) {
    await services.Orcamento(idChamado);

    const ordensDirecionadas = await filterOrders.buscarOrdensDirecionadas();
    const tecnicos = await filterOrders.buscarUsers();

    const data = {
      ordens: ordensDirecionadas,
      tecnicos: tecnicos,
    };

    return data;
  },

  async IniciarDeslocamento(id_tecnico, id_chamado) {
    await services.IniciarDeslocamento(id_tecnico, id_chamado);

    const ordensDirecionadas = await filterOrders.buscarOrdensDirecionadas();
    const tecnicos = await filterOrders.buscarUsers();
    // console.log('ordens', ordensDirecionadas)
    const data = {
      ordens: ordensDirecionadas,
      tecnicos: tecnicos,
    };

    return data;
  },

  async FinalizarDeslocamento(idDeslocamento) {
    await services.FinalizarDeslocamento(idDeslocamento);

    const ordensDirecionadas = await filterOrders.buscarOrdensDirecionadas();
    const tecnicos = await filterOrders.buscarUsers();

    const data = {
      ordens: ordensDirecionadas,
      tecnicos: tecnicos,
    };

    return data;
  },

  async IniciarDescanso(idTecnico) {
    await services.IniciarDescanso(idTecnico);

    const ordensDirecionadas = await filterOrders.buscarOrdensDirecionadas();
    const tecnicos = await filterOrders.buscarUsers();

    const data = {
      ordens: ordensDirecionadas,
      tecnicos: tecnicos,
    };

    return data;

  },

  async FinalizarDescanso(idDescanso) {
    await services.FinalizarDescanso(idDescanso);

    const ordensDirecionadas = await filterOrders.buscarOrdensDirecionadas();
    const tecnicos = await filterOrders.buscarUsers();

    const data = {
      ordens: ordensDirecionadas,
      tecnicos: tecnicos,
    };

    return data;
  },

  async IniciarAtendimentoComDeslocamento(idChamado, idEvento) {
    await services.FinalizarDeslocamento(idEvento);

    await services.IniciarAtendimento(idChamado);

    const ordensDirecionadas = await filterOrders.buscarOrdensDirecionadas();
    const tecnicos = await filterOrders.buscarUsers();

    const data = {
      ordens: ordensDirecionadas,
      tecnicos: tecnicos,
    };

    return data;
  }
};
