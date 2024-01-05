const { conexao } = require("../../config/env");

exports.concluirAtendimento = async (idChamado) => {
  const conn = await conexao();

  const dataAtual = obterDataAtualFormatada();

  await conn.query(
    `
        UPDATE chamados
        SET
          chamado_status = '4',
          chamado_hora_final = '${dataAtual}'
        WHERE
          chamado_id = '${idChamado}'
        `
  );
};

exports.IniciarAtendimento = async (idChamado) => {
  const conn = await conexao();

  const dataAtual = obterDataAtualFormatada();

  await conn.query(
    `
        UPDATE chamados
        SET
          chamado_status = '7',
          chamado_hora_inicio = '${dataAtual}'
        WHERE
          chamado_id = '${idChamado}'
        `
  );
};

exports.CancelarAtendimento = async (idChamado) => {
  const conn = await conexao();

  await conn.query(
    `
        UPDATE chamados
        SET
          chamado_status = '3',
        WHERE
          chamado_id = '${idChamado}'
        `
  );
};

exports.AtendimentoImpedido = async (idChamado) => {
  const conn = await conexao();

  await conn.query(
    `
        UPDATE chamados
        SET
          chamado_status = '5',
        WHERE
          chamado_id = '${idChamado}'
        `
  );
};

exports.Orcamento = async (idChamado) => {
  const conn = await conexao();

  await conn.query(
    `
        UPDATE chamados
        SET
          chamado_status = '6',
        WHERE
          chamado_id = '${idChamado}'
        `
  );
};

exports.IniciarDeslocamento = async (idTecnico, idChamado) => {
  const conn = await conexao();

  const dataAtual = obterDataAtualFormatada();

  await conn.query(
    `
    INSERT INTO os_eventos 
    (id_tecnico, evento_inicio,
       tipo, status, evento_chamado) VALUE
        ('${idTecnico}','${dataAtual}','2','7','${idChamado}')
        `
  );
};

exports.FinalizarDeslocamento = async (idDeslocamento) => {
  const conn = await conexao();

  const dataAtual = obterDataAtualFormatada();

  await conn.query(
    `
    update os_eventos set status ='4', evento_fim = '${dataAtual}}' where id = '${idDeslocamento}' 
        `
  );
};

exports.IniciarDescanso = async (idTecnico) => {
  const conn = await conexao();

  const dataAtual = obterDataAtualFormatada();

  await conn.query(
    `
    INSERT INTO os_eventos 
    (id_tecnico, evento_inicio,
       tipo, status, evento_chamado) VALUE
        ('${idTecnico}','${dataAtual}','1','7')
        `
  );
};

exports.FinalizarDescanso = async (idDescanso) => {
  const conn = await conexao();

  const dataAtual = obterDataAtualFormatada();

  await conn.query(
    `
    update os_eventos set status ='4', evento_fim = '${dataAtual}}' where id = '${idDescanso}' 
        `
  );
};

function obterDataAtualFormatada() {
  const dataAtual = new Date();
  const ano = dataAtual.getFullYear();
  const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
  const dia = String(dataAtual.getDate()).padStart(2, "0");
  const horas = String(dataAtual.getHours()).padStart(2, "0");
  const minutos = String(dataAtual.getMinutes()).padStart(2, "0");
  const segundos = String(dataAtual.getSeconds()).padStart(2, "0");

  return `${ano}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
}
