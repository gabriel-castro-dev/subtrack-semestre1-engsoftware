// ==========================================================
// SubTrack — detalhes de uma assinatura
// ==========================================================

const cartaoDetalhes = document.querySelector("#detalhes-assinatura");
const naoEncontrada = document.querySelector("#nao-encontrada");

const id = obterIdDaUrl();
const assinatura = buscarAssinatura(id);

// Texto que explica quanto falta para a renovação
function descreverPrazo(dataIso) {
  const dias = diasAte(dataIso);
  if (dias < 0) return "Data já passou. Atualize a renovação pela edição.";
  if (dias === 0) return "Renova hoje.";
  if (dias === 1) return "Renova amanhã.";
  return `Renova em ${dias} dias.`;
}

function preencherCampo(nome, texto) {
  cartaoDetalhes.querySelector(`[data-campo="${nome}"]`).textContent = texto;
}

function exibirDetalhes(assinatura) {
  document.title = `${assinatura.nome} | SubTrack — Controle de Assinaturas`;

  const avatar = criarAvatar(assinatura);
  document.querySelector("#detalhes-avatar").replaceWith(avatar);
  document.querySelector("#detalhes-nome").textContent = assinatura.nome;
  document.querySelector("#detalhes-status").replaceWith(criarEtiquetaStatus(assinatura.status));

  preencherCampo("nome", assinatura.nome);
  preencherCampo("categoria", CATEGORIAS[assinatura.categoria]);
  preencherCampo("valor", formatarMoeda(assinatura.valor, assinatura.moeda));
  preencherCampo("moeda", NOMES_MOEDA[assinatura.moeda]);
  preencherCampo("periodicidade", PERIODICIDADES[assinatura.periodicidade]);
  preencherCampo("renovacao", formatarData(assinatura.renovacao));
  preencherCampo("prazo", descreverPrazo(assinatura.renovacao));
  preencherCampo("status", assinatura.status === "ativa" ? "Ativa" : "Inativa");

  document.querySelector("#link-editar").href = `editar.html?id=${encodeURIComponent(assinatura.id)}`;
  document.querySelector("#link-excluir").href = `excluir.html?id=${encodeURIComponent(assinatura.id)}`;

  cartaoDetalhes.hidden = false;
}

// ---------- Conversão para reais (Frankfurter API) ----------

const notaCotacao = document.querySelector("#nota-cotacao");
const textoCotacao = document.querySelector("#cotacao-texto");
const botaoTentarCotacao = document.querySelector("#tentar-cotacao");

function exibirValoresEmReais(cotacoes, situacao) {
  const emReais = converterParaReais(assinatura.valor, assinatura.moeda, cotacoes);
  const mensal = valorMensalEmReais(assinatura, cotacoes);

  if (emReais === null) {
    const texto = situacao === "erro" ? "Cotação indisponível" : "Consultando cotação…";
    preencherCampo("em-reais", texto);
    preencherCampo("mensal", texto);
    return;
  }

  const prefixo = assinatura.moeda === "BRL" ? "" : "≈ ";
  const periodo = assinatura.periodicidade === "anual" ? "por ano" : "por mês";
  preencherCampo("em-reais", `${prefixo}${formatarMoeda(emReais)} ${periodo}`);
  preencherCampo("mensal", `${prefixo}${formatarMoeda(mensal)} por mês`);
}

async function carregarCotacoes() {
  botaoTentarCotacao.hidden = true;
  textoCotacao.textContent = "Consultando cotação…";
  exibirValoresEmReais(null, "carregando");

  try {
    const cotacoes = await buscarCotacoes();
    textoCotacao.textContent = `${descreverCotacoes(cotacoes)} (cotação de ${formatarData(cotacoes.data)})`;
    exibirValoresEmReais(cotacoes, "ok");
  } catch (erro) {
    console.error("Falha ao consultar a Frankfurter API.", erro);
    textoCotacao.textContent = "Cotação indisponível. Tente novamente.";
    botaoTentarCotacao.hidden = false;
    exibirValoresEmReais(null, "erro");
  }
}

botaoTentarCotacao.addEventListener("click", carregarCotacoes);

exibirMensagemGuardada(document.querySelector("#mensagem-sucesso"));

if (assinatura) {
  exibirDetalhes(assinatura);
  if (assinatura.moeda === "BRL") {
    exibirValoresEmReais(null, "ok");
  } else {
    notaCotacao.hidden = false;
    carregarCotacoes();
  }
} else {
  naoEncontrada.hidden = false;
}
