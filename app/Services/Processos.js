const { conexao } = require("../../config/env");

exports.iniciarChamado = async () => {
  const conn = await conexao();

  await conn.query(
    `
        UPDATE chamados
        SET
          chamado_status = '4',
          chamado_hora_inicio = '2024-01-04 11:41:00.00',
          chamado_hora_final = '2024-01-04 12:41:00.00'
        WHERE
          chamado_os = '75'
        `
  );

};
