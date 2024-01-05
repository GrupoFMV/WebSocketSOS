const { conexao } = require("../../config/env");

exports.buscarOrdensDirecionadas = async () => {
  try {
    const dataAtualFormat = obterDataAtualFormatada();

    console.log(dataAtualFormat);
    const conn = await conexao();

    const [rowsChamados] = await conn.query(
      `
        SELECT chamados.*, clientes.cliente_fantasia, os_tipos.os_tipo_nome, os_tipos.os_tipos_tempo, os_status.os_status_nome 
        FROM chamados 
        JOIN clientes ON chamado_cliente = clientes.cliente_id 
        JOIN os_status ON chamado_status = os_status.os_status_id 
        JOIN os_tipos ON chamado_tipo = os_tipos.os_tipo_id 
        WHERE DATE(chamado_data_referencia) = ?
      `,
      [dataAtualFormat]
    );

    const [rowsEventos] = await conn.query(
      `
        SELECT os_eventos.*, id_tecnico AS os_usuario, os_status.os_status_nome AS statusName, os_tipo_eventos.nome_evento 
        FROM os_eventos 
        JOIN os_status ON os_eventos.status = os_status.os_status_id 
        JOIN os_tipo_eventos ON os_eventos.tipo = os_tipo_eventos.id_evento 
        WHERE DATE(evento_data_referencia) = ?
      `,
      [dataAtualFormat]
    );

    const [rowsUsers] = await conn.query(
      "SELECT * from users where user_tipo = 2"
    );

    const data2 = rowsUsers.map((row, index) => ({
      id: index + 1,
      idTecnico: row["user_id"],
      name: row["user_nome"],
    }));

    const juncaoEventosOs = rowsChamados.concat(rowsEventos);

    let OsPorTecnico = [];

    for (let order of juncaoEventosOs) {
      let technician = null;

      for (let tech of data2) {
        if (
          tech["idTecnico"] === order["chamado_tecnico"] ||
          tech["idTecnico"] === order["id_tecnico"]
        ) {
          technician = tech;
          break;
        }
      }

      if (technician) {
        order["location"] = technician["id"];
      }

      let statusToClassNameMap = {
        "Em atendimento": "atendimento",
        Direcionado: "direcionado",
        Cancelado: "cancelado",
        Concluido: "concluido",
        Orçamento: "orcamento",
        Impedido: "impedido",
      };

      let statusToClassNameMapEvent = {
        deslocamento: "deslocamento",
        descanso: "descanso",
      };

      order["className"] = statusToClassNameMap[order["os_status_nome"]];

      if (order["nome_evento"]) {
        order["className"] = statusToClassNameMapEvent[order["nome_evento"]];
      }

      order["userData"] = {
        id_os: order["chamado_id"] || order["id"],
        locations: data2,
        cliente: order["cliente_fantasia"] || order["nome_evento"],
        event_dataAbertura:
          order["chamado_data_referencia"] || order["evento_data_referencia"],
        codigo_cliente: order["chamado_cliente"] || order["id"],
        observacoes: order["chamado_observacoes"] || order["nome_evento"],
        tipo: order["chamado_tipo"] || order["tipo"],
        os_id: order["chamado_os"] || order["id"],
      };

      let tecnicoIndex = OsPorTecnico.findIndex(
        (tech) => tech["idTecnico"] === technician["idTecnico"]
      );

      if (tecnicoIndex !== -1) {
        OsPorTecnico[tecnicoIndex]["ordens"].push(order);
      } else {
        OsPorTecnico.push({
          idTecnico: technician["idTecnico"],
          ordens: [order],
        });
      }
    }

    let teste = await gerarHoraInicio(OsPorTecnico);
    let resultadoFinal = JSON.stringify(teste);
    return resultadoFinal;
  } catch (error) {
    console.error("Erro ao buscar ordens direcionadas:", error);
    throw new Error("Erro interno do servidor");
  }
};

exports.buscarUsers = async () => {
    const conn = await conexao();
    let query1 = "SELECT * from users where user_tipo = 2";
    let result1;
    try {
      [result1] = await conn.execute(query1);
    } catch (error) {
      throw new Error("Erro na consulta: " + error);
    }
    let usuarios = result1.map((row, index) => ({
      id: index + 1,
      idTecnico: row["user_id"],
      name: row["user_nome"],
    }));
    let resultadoJson = JSON.stringify(usuarios);
    return resultadoJson;
  };

function obterDataAtualFormatada() {
  const dataAtual = new Date();
  const ano = dataAtual.getFullYear();
  const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
  const dia = String(dataAtual.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function gerarHoraInicio(OsPorTecnicoFunction) {
  let ordensAlteradas = [];

  for (let tecnico of OsPorTecnicoFunction) {
    let ordensDoTecnico = tecnico["ordens"];
    ordensDoTecnico.sort(function (a, b) {
      let timeA = new Date(
        a["chamado_hora_inicial_esperada"] || a["evento_inicio"]
      ).getTime();
      let timeB = new Date(
        b["chamado_hora_inicial_esperada"] || b["evento_inicio"]
      ).getTime();
      return timeA - timeB;
    });
    for (let i = 0; i < ordensDoTecnico.length; i++) {
      let ordem = ordensDoTecnico[i];
      if (
        compareCurrentTime(ordem["chamado_hora_inicial_esperada"]) == 1 &&
        ordem["os_status_nome"] == "Direcionado"
      ) {
        if (i === 0) {
          ordem["start"] = getCurrentTime();
          ordem["end"] = addMinutesToTime(
            ordem["start"],
            parseInt(ordem["os_tipos_tempo"])
          );
        } else {
          let ordemAnterior = ordensDoTecnico[i - 1];
          if (
            verifyOrdemAnterior(
              ordemAnterior["end"],
              ordem["chamado_hora_inicial_esperada"]
            ) == 1
          ) {
            ordem["start"] = add_minute(ordemAnterior["end"]);
            ordem["end"] = addMinutesToTime(
              ordem["start"],
              parseInt(ordem["os_tipos_tempo"])
            );
          } else if (
            verifyOrdemAnterior(
              ordemAnterior["end"],
              ordem["chamado_hora_inicial_esperada"]
            ) == 0
          ) {
            ordem["start"] = ordem["chamado_hora_inicial_esperada"];
            ordem["end"] = addMinutesToTime(
              ordem["start"],
              parseInt(ordem["os_tipos_tempo"])
            );
          }
        }
        ordem["start"] = getCurrentTime();
        ordem["end"] = addMinutesToTime(
          ordem["start"],
          parseInt(ordem["os_tipos_tempo"])
        );
        ordensAlteradas.push(ordem);
        continue;
      }
      if (
        compareCurrentTime(ordem["chamado_hora_inicial_esperada"]) == 0 &&
        ordem["os_status_nome"] == "Direcionado"
      ) {
        if (i === 0) {
          ordem["start"] = ordem["chamado_hora_inicial_esperada"];
          ordem["end"] = addMinutesToTime(
            ordem["start"],
            parseInt(ordem["os_tipos_tempo"])
          );
        } else {
          let ordemAnterior = ordensDoTecnico[i - 1];
          if (
            verifyOrdemAnterior(
              ordemAnterior["end"],
              ordem["chamado_hora_inicial_esperada"]
            ) == 1
          ) {
            ordem["start"] = add_minute(ordemAnterior["end"]);
            ordem["end"] = addMinutesToTime(
              ordem["start"],
              parseInt(ordem["os_tipos_tempo"])
            );
          } else if (
            verifyOrdemAnterior(
              ordemAnterior["end"],
              ordem["chamado_hora_inicial_esperada"]
            ) == 0
          ) {
            ordem["start"] = ordem["chamado_hora_inicial_esperada"];
            ordem["end"] = addMinutesToTime(
              ordem["start"],
              parseInt(ordem["os_tipos_tempo"])
            );
          }
        }
        ordensAlteradas.push(ordem);
        continue;
      }
      if (
        ordem["os_status_nome"] == "Em atendimento" ||
        ordem["statusName"] == "Em atendimento"
      ) {
        ordem["start"] = ordem["chamado_hora_inicio"]
          ? ordem["chamado_hora_inicio"]
          : ordem["evento_inicio"];
        ordem["end"] = getCurrentTime();
        ordensAlteradas.push(ordem);
        continue;
      }
      if (ordem["os_status_nome"] || ordem["statusName"] == "Concluido") {
        ordem["start"] = ordem["chamado_hora_inicio"]
          ? ordem["chamado_hora_inicio"]
          : ordem["evento_inicio"];
        ordem["end"] = ordem["chamado_hora_final"] || ordem["evento_fim"];
        ordensAlteradas.push(ordem);
        continue;
      }
      if (ordem["os_status_nome"] == "Orçamento") {
        ordem["start"] = ordem["chamado_hora_inicio"];
        ordem["end"] = ordem["chamado_hora_final"];
        ordensAlteradas.push(ordem);
        continue;
      }
      if (ordem["os_status_nome"] == "Cancelado") {
        ordem["start"] = ordem["chamado_hora_inicial_esperada"];
        ordem["end"] = ordem["chamado_hora_inicial_esperada"];
        ordensAlteradas.push(ordem);
        continue;
      }
      if (ordem["os_status_nome"] == "Impedido") {
        if (ordem["chamado_hora_inicio"]) {
          ordem["start"] = ordem["chamado_hora_inicio"];
          ordem["end"] = ordem["chamado_hora_final"];
          ordensAlteradas.push(ordem);
        } else {
          ordem["start"] = ordem["chamado_hora_inicial_esperada"];
          ordem["end"] = ordem["chamado_hora_inicial_esperada"];
          ordensAlteradas.push(ordem);
        }
        continue;
      }
    }
  }
  return ordensAlteradas;
}

function add_minute(time) {
  let datetime = new Date(time);
  datetime.setMinutes(datetime.getMinutes() + 1);
  return datetime.toISOString().slice(0, 19).replace("T", " ");
}

function verifyOrdemAnterior(horaOrdemAnterior, horaOrdemAtual) {
  let datetime1 = new Date(horaOrdemAnterior);
  let datetime2 = new Date(horaOrdemAtual);
  if (datetime1 > datetime2) {
    return 1;
  } else {
    return 0;
  }
}

function addMinutesToTime(initialTime, minutesToAdd) {
  let isoTime = initialTime.replace(' ', 'T') + 'Z';
  let updatedTime = new Date(isoTime);
  updatedTime.setMinutes(updatedTime.getMinutes() + minutesToAdd);
  let retorno = updatedTime.toISOString().slice(0, 19).replace("T", " ");
  return retorno;
}


function getCurrentTime() {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'America/Sao_Paulo',
  };

  const brasilDate = new Intl.DateTimeFormat('en-US', options).format(new Date());

  return brasilDate.replace(/\//g, '-').replace(',', '');
}

function compareCurrentTime(timeString, timezone = "America/Sao_Paulo") {
  let currentTime = new Date().toLocaleString("en-US", {
    timeZone: "America/Sao_Paulo",
  });
  currentTime = new Date(currentTime);
  let comparisonTime = new Date(timeString);
  comparisonTime.toLocaleString("en-US", { timeZone: timezone });
  if (currentTime > comparisonTime) {
    return 1;
  } else if (currentTime < comparisonTime) {
    return 0;
  } else {
    return 2;
  }
}