// ==========================================================
// SubTrack — formulário de cadastro e edição de assinaturas
// ==========================================================

const formulario = document.querySelector("#formulario-assinatura");
const mensagemFormulario = document.querySelector("#mensagem-formulario");

const campos = {
  nome: formulario.elements.nome,
  categoria: formulario.elements.categoria,
  valor: formulario.elements.valor,
  moeda: formulario.elements.moeda,
  periodicidade: formulario.elements.periodicidade,
  renovacao: formulario.elements.renovacao,
  status: formulario.elements.status,
};

let assinaturas = carregarAssinaturas();

// Na página de edição o endereço traz o id (editar.html?id=...)
const idEdicao = obterIdDaUrl();
const emEdicao = idEdicao !== null;
const assinaturaEditada = emEdicao ? assinaturas.find((item) => item.id === idEdicao) : null;

// ---------- Mensagens de erro dos campos ----------

function mostrarErro(campo, mensagem) {
  let erro = campo.parentElement.querySelector(".campo-erro");
  if (!erro) {
    erro = criarElemento("span", "campo-erro");
    erro.id = `${campo.id}-erro`;
    campo.parentElement.append(erro);
  }
  erro.textContent = mensagem;
  campo.setAttribute("aria-invalid", "true");

  const descricoes = (campo.getAttribute("aria-describedby") || "").split(" ").filter(Boolean);
  if (!descricoes.includes(erro.id)) descricoes.push(erro.id);
  campo.setAttribute("aria-describedby", descricoes.join(" "));
}

function limparErro(campo) {
  const erro = campo.parentElement.querySelector(".campo-erro");
  if (erro) erro.textContent = "";
  campo.removeAttribute("aria-invalid");
}

function mostrarMensagem(texto, tipo) {
  mensagemFormulario.textContent = texto;
  mensagemFormulario.className = `mensagem mensagem-${tipo}`;
  mensagemFormulario.hidden = false;
}

// ---------- Validação ----------

// Retorna um objeto { campo: "mensagem de erro" } com os problemas encontrados
function validar(dados) {
  const erros = {};

  if (dados.nome.length < 2) {
    erros.nome = "Informe o nome do serviço (pelo menos 2 caracteres).";
  } else if (dados.nome.length > 60) {
    erros.nome = "Use no máximo 60 caracteres.";
  } else {
    const repetida = assinaturas.some(
      (item) => item.nome.toLowerCase() === dados.nome.toLowerCase() && item.id !== idEdicao,
    );
    if (repetida) erros.nome = "Já existe uma assinatura com esse nome.";
  }

  if (!(dados.categoria in CATEGORIAS)) {
    erros.categoria = "Selecione uma categoria.";
  }

  if (Number.isNaN(dados.valor) || dados.valor <= 0) {
    erros.valor = "Informe um valor maior que zero.";
  } else if (Math.abs(dados.valor * 100 - Math.round(dados.valor * 100)) > 0.000001) {
    erros.valor = "Use no máximo duas casas decimais.";
  } else if (dados.valor > 100000) {
    erros.valor = "Informe um valor menor que 100.000.";
  }

  if (!(dados.moeda in NOMES_MOEDA)) {
    erros.moeda = "Selecione uma moeda.";
  }

  if (!(dados.periodicidade in PERIODICIDADES)) {
    erros.periodicidade = "Selecione a periodicidade.";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.renovacao)) {
    erros.renovacao = "Informe a data de renovação.";
  }

  if (dados.status !== "ativa" && dados.status !== "inativa") {
    erros.status = "Selecione o status.";
  }

  return erros;
}

// ---------- Edição: preenche o formulário com os dados salvos ----------

function preencherFormulario(assinatura) {
  for (const nome in campos) {
    campos[nome].value = assinatura[nome];
  }
  campos.valor.value = assinatura.valor.toFixed(2);
  document.querySelector("#nome-edicao").textContent = assinatura.nome;
  document.querySelector("#link-cancelar").href = `detalhes.html?id=${encodeURIComponent(assinatura.id)}`;
  document.title = `Editar ${assinatura.nome} | SubTrack — Controle de Assinaturas`;
}

if (emEdicao) {
  if (assinaturaEditada) {
    preencherFormulario(assinaturaEditada);
  } else {
    formulario.hidden = true;
    document.querySelector("#nao-encontrada").hidden = false;
  }
}

// ---------- Envio ----------

function lerFormulario() {
  return {
    nome: campos.nome.value.trim(),
    categoria: campos.categoria.value,
    valor: Number(campos.valor.value.replace(",", ".")),
    moeda: campos.moeda.value,
    periodicidade: campos.periodicidade.value,
    renovacao: campos.renovacao.value,
    status: campos.status.value,
  };
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const dados = lerFormulario();
  const erros = validar(dados);

  for (const nome in campos) {
    limparErro(campos[nome]);
  }

  const camposComErro = Object.keys(erros);
  if (camposComErro.length > 0) {
    for (const nome of camposComErro) {
      mostrarErro(campos[nome], erros[nome]);
    }
    mostrarMensagem("Não foi possível salvar. Corrija os campos destacados.", "erro");
    campos[camposComErro[0]].focus();
    return;
  }

  if (emEdicao) {
    const posicao = assinaturas.findIndex((item) => item.id === idEdicao);
    assinaturas[posicao] = { ...dados, id: idEdicao };
    salvarAssinaturas(assinaturas);
    guardarMensagem("Alterações salvas com sucesso.");
    window.location.href = `detalhes.html?id=${encodeURIComponent(idEdicao)}`;
  } else {
    const nova = { id: gerarId(), ...dados };
    assinaturas.push(nova);
    salvarAssinaturas(assinaturas);
    guardarMensagem(`${nova.nome} foi cadastrada com sucesso.`);
    window.location.href = "../index.html";
  }
});

// Remove o erro do campo assim que a pessoa corrige o valor
for (const nome in campos) {
  campos[nome].addEventListener("input", () => limparErro(campos[nome]));
}
