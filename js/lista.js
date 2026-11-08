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

function criarLinha(assinatura) {
  const linha = document.createElement("tr");
  if (assinatura.status === "inativa") linha.classList.add("linha-inativa");

  const servico = document.createElement("th");
  servico.scope = "row";
  servico.append(criarAvatar(assinatura), " ", assinatura.nome);

  const valor = criarElemento("td", "", formatarMoeda(assinatura.valor, assinatura.moeda));

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

function atualizarLista() {
  const resultado = filtrarAssinaturas(assinaturas, lerFiltros());
  renderizarLista(resultado);
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

exibirMensagemGuardada(mensagemSucesso);
atualizarLista();
