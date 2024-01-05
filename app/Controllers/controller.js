const services = require('../Services/Processos')
const filterOrders = require('../Services/filterOrders')
module.exports = {
  async IniciarATendimento() {

    await services.iniciarChamado()

    const ordensDirecionadas = await filterOrders.buscarOrdensDirecionadas()
    const tecnicos = await filterOrders.buscarUsers()

    const data = {
      ordens: ordensDirecionadas,
      tecnicos: tecnicos
    }

    return data
  },
};
