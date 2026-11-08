// ==========================================================
// SubTrack — página inicial: listagem das assinaturas
// ==========================================================

const corpoTabela = document.querySelector("#corpo-tabela");
const contadorLista = document.querySelector("#contador-lista");
const listaVazia = document.querySelector("#lista-vazia");
const tabelaContainer = document.querySelector(".tabela-container");
const mensagemSucesso = document.querySelector("#mensagem-sucesso");
const formularioFiltros = document.querySelector("#filtros");
const semResultados = document.querySelector("#sem-resultados");

let assinaturas = carregarAssinaturas();
let cotacoes = null;        // preenchido quando a Frankfurter API responder
let erroCotacao = false;

function criarLinkAcao(texto, pagina, id, classeExtra = "") {
  const link = criarElemento("a", `acao ${classeExtra}`.trim(), texto);
  link.href = `pages/${pagina}?id=${encodeURIComponent(id)}`;
  return link;
}

function criarCelulaRenovacao(assinatura) {
  const celula = document.createElement("td");
  const data = criarElemento("time", "", formatarData(assinatura.renovacao));
  data.dateTime = assinatura.renovacao;
  celula.append(data);

  if (assinatura.status === "ativa") {
    const dias = diasAte(assinatura.renovacao);
    if (dias < 0) {
      celula.append(" ", criarElemento("span", "etiqueta-revisar", "Revisar data"));
    } else if (dias <= 7) {
      celula.classList.add("renovacao-proxima");
    }
  }
  return celula;
}

// Texto exibido abaixo dos valores em dólar ou euro
function textoConvertido(assinatura) {
  const emReais = converterParaReais(assinatura.valor, assinatura.moeda, cotacoes);
  if (emReais !== null) return `(aprox. ${formatarMoeda(emReais)})`;
  return erroCotacao ? "(cotação indisponível)" : "(consultando cotação…)";
}

function criarLinha(assinatura) {
  const linha = document.createElement("tr");
  if (assinatura.status === "inativa") linha.classList.add("linha-inativa");

  const servico = document.createElement("th");
  servico.scope = "row";
  servico.append(criarAvatar(assinatura), " ", assinatura.nome);

  const valor = criarElemento("td", "", formatarMoeda(assinatura.valor, assinatura.moeda));
  if (assinatura.moeda !== "BRL") {
    valor.append(criarElemento("span", "valor-convertido", textoConvertido(assinatura)));
  }

  const status = document.createElement("td");
  status.append(criarEtiquetaStatus(assinatura.status));

  const acoes = criarElemento("td", "acoes");
  acoes.append(
    criarLinkAcao("Ver detalhes", "detalhes.html", assinatura.id),
    criarLinkAcao("Editar", "editar.html", assinatura.id),
    criarLinkAcao("Excluir", "excluir.html", assinatura.id, "acao-excluir"),
  );

  linha.append(
    servico,
    criarElemento("td", "", CATEGORIAS[assinatura.categoria]),
    valor,
    criarElemento("td", "", assinatura.moeda),
    criarElemento("td", "", PERIODICIDADES[assinatura.periodicidade]),
    criarCelulaRenovacao(assinatura),
    status,
    acoes,
  );
  return linha;
}

function renderizarLista(lista) {
  corpoTabela.innerHTML = "";

  for (const assinatura of lista) {
    corpoTabela.append(criarLinha(assinatura));
  }

  const vazia = assinaturas.length === 0;
  const semNenhumResultado = !vazia && lista.length === 0;
  listaVazia.hidden = !vazia;
  semResultados.hidden = !semNenhumResultado;
  tabelaContainer.hidden = vazia || semNenhumResultado;
  contadorLista.textContent = vazia
    ? ""
    : `${lista.length} de ${assinaturas.length} assinaturas exibidas.`;
}

// ---------- Pesquisa e filtros ----------

// Remove acentos e maiúsculas para comparar textos ("Música" → "musica")
function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function lerFiltros() {
  return {
    busca: normalizar(formularioFiltros.elements.busca.value.trim()),
    categoria: formularioFiltros.elements.categoria.value,
    status: formularioFiltros.elements.status.value,
    ordenacao: formularioFiltros.elements.ordenacao.value,
  };
}

function filtrarAssinaturas(lista, filtros) {
  return lista.filter((item) => {
    const nomeConfere = normalizar(item.nome).includes(filtros.busca);
    const categoriaConfere = filtros.categoria === "todas" || item.categoria === filtros.categoria;
    const statusConfere = filtros.status === "todos" || item.status === filtros.status;
    return nomeConfere && categoriaConfere && statusConfere;
  });
}

// ---------- Ordenação ----------

// Valor usado para comparar preços: em reais quando a cotação estiver disponível
function valorParaComparar(item) {
  const emReais = converterParaReais(item.valor, item.moeda, cotacoes);
  return emReais === null ? item.valor : emReais;
}

function compararRenovacao(a, b) {
  // As inativas ficam sempre no final da lista
  if (a.status !== b.status) return a.status === "ativa" ? -1 : 1;
  return a.renovacao.localeCompare(b.renovacao);
}

function ordenarAssinaturas(lista, criterio) {
  const copia = [...lista];

  switch (criterio) {
    case "nome":
      copia.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
      break;
    case "menor-valor":
      copia.sort((a, b) => valorParaComparar(a) - valorParaComparar(b));
      break;
    case "maior-valor":
      copia.sort((a, b) => valorParaComparar(b) - valorParaComparar(a));
      break;
    default:
      copia.sort(compararRenovacao);
  }
  return copia;
}

function atualizarLista() {
  const filtros = lerFiltros();
  const filtradas = filtrarAssinaturas(assinaturas, filtros);
  renderizarLista(ordenarAssinaturas(filtradas, filtros.ordenacao));
}

// A lista é atualizada enquanto a pessoa digita ou troca um filtro
formularioFiltros.addEventListener("input", atualizarLista);
formularioFiltros.addEventListener("submit", (evento) => {
  evento.preventDefault();
  atualizarLista();
});
// O evento "reset" acontece antes de os campos voltarem ao padrão
formularioFiltros.addEventListener("reset", () => setTimeout(atualizarLista));
document.querySelector("#limpar-filtros-vazio").addEventListener("click", () => formularioFiltros.reset());

// ---------- Resumo dos gastos e próximas renovações ----------

// Os totais consideram todas as assinaturas ativas, independentemente dos filtros
function renderizarResumo() {
  const ativas = assinaturas.filter((item) => item.status === "ativa");
  let mensal = 0;
  const semConversao = [];

  for (const item of ativas) {
    const valorMensal = valorMensalEmReais(item, cotacoes);
    if (valorMensal === null) {
      semConversao.push(item.nome);
    } else {
      mensal += valorMensal;
    }
  }

  const aviso = document.querySelector("#resumo-aviso");
  document.querySelector("#resumo-ativas").textContent = ativas.length;

  // Evita apresentar uma soma incompleta como se fosse o total
  if (semConversao.length > 0) {
    document.querySelector("#resumo-mensal").textContent = "—";
    document.querySelector("#resumo-anual").textContent = "—";
    aviso.textContent = erroCotacao
      ? `Não foi possível converter ${semConversao.join(", ")} para reais. Os totais aparecem quando a cotação estiver disponível.`
      : "Consultando cotação para calcular os totais…";
    aviso.hidden = false;
  } else {
    document.querySelector("#resumo-mensal").textContent = formatarMoeda(mensal);
    document.querySelector("#resumo-anual").textContent = formatarMoeda(mensal * 12);
    aviso.hidden = true;
  }
}

function renderizarRenovacoes() {
  const listaRenovacoes = document.querySelector("#renovacoes-lista");
  const proximas = assinaturas
    .filter((item) => item.status === "ativa" && diasAte(item.renovacao) >= 0 && diasAte(item.renovacao) <= 7)
    .sort((a, b) => a.renovacao.localeCompare(b.renovacao));

  listaRenovacoes.innerHTML = "";
  let total = 0;
  let totalCompleto = true;

  for (const item of proximas) {
    const emReais = converterParaReais(item.valor, item.moeda, cotacoes);
    if (emReais === null) {
      totalCompleto = false;
    } else {
      total += emReais;
    }

    const data = criarElemento("time", "", formatarData(item.renovacao));
    data.dateTime = item.renovacao;
    const linha = document.createElement("li");
    linha.append(
      criarElemento("span", "", item.nome),
      data,
      criarElemento("span", "", formatarMoeda(item.valor, item.moeda)),
    );
    listaRenovacoes.append(linha);
  }

  const textoTotal = totalCompleto ? formatarMoeda(total) : "—";
  document.querySelector("#renovacoes-total").textContent =
    proximas.length > 0 ? `Próximos 7 dias: ${textoTotal}` : "Próximos 7 dias";
  document.querySelector("#renovacoes-vazia").hidden = proximas.length > 0;
}

function renderizarPainel() {
  renderizarResumo();
  renderizarRenovacoes();
}

// ---------- Cotação do dia (Frankfurter API) ----------

const textoCotacao = document.querySelector("#cotacao-texto");
const botaoTentarCotacao = document.querySelector("#tentar-cotacao");

async function carregarCotacoes() {
  erroCotacao = false;
  botaoTentarCotacao.hidden = true;
  textoCotacao.textContent = "Consultando cotação…";

  try {
    cotacoes = await buscarCotacoes();
    textoCotacao.textContent = `${descreverCotacoes(cotacoes)} (cotação de ${formatarData(cotacoes.data)})`;
  } catch (erro) {
    console.error("Falha ao consultar a Frankfurter API.", erro);
    erroCotacao = true;
    textoCotacao.textContent = "Cotação indisponível. Tente novamente.";
    botaoTentarCotacao.hidden = false;
  }
  atualizarLista();
  renderizarPainel();
}

botaoTentarCotacao.addEventListener("click", carregarCotacoes);

exibirMensagemGuardada(mensagemSucesso);
atualizarLista();
renderizarPainel();
carregarCotacoes();
