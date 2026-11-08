// ==========================================================
// SubTrack — dados e funções compartilhadas pelas páginas
// ==========================================================

const CHAVE_ARMAZENAMENTO = "subtrack:assinaturas";

const CATEGORIAS = {
  musica: "Música",
  video: "Vídeo",
  produtividade: "Produtividade",
  armazenamento: "Armazenamento",
  educacao: "Educação",
  outros: "Outros",
};

const PERIODICIDADES = {
  mensal: "Mensal",
  anual: "Anual",
};

const NOMES_MOEDA = {
  BRL: "BRL — Real brasileiro",
  USD: "USD — Dólar americano",
  EUR: "EUR — Euro",
};

// Cor das iniciais de acordo com a categoria
const CORES_AVATAR = {
  musica: "verde",
  video: "vermelho",
  produtividade: "escuro",
  armazenamento: "azul",
  educacao: "marinho",
  outros: "roxo",
};

// ---------- Datas ----------

// Converte um objeto Date para o formato "AAAA-MM-DD"
function paraDataIso(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

// Data de hoje somada a uma quantidade de dias
function dataDaquiA(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return paraDataIso(data);
}

// "2026-10-29" → "29/10/2026"
function formatarData(dataIso) {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

// Quantidade de dias entre hoje e a data informada (negativa se já passou)
function diasAte(dataIso) {
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((data - hoje) / 86400000);
}

// ---------- Valores ----------

function formatarMoeda(valor, moeda = "BRL") {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: moeda });
}

// ---------- Armazenamento (localStorage) ----------

// Assinaturas de exemplo usadas no primeiro acesso
function criarDadosIniciais() {
  return [
    { id: "spotify", nome: "Spotify", categoria: "musica", valor: 21.9, moeda: "BRL", periodicidade: "mensal", renovacao: dataDaquiA(3), status: "ativa" },
    { id: "netflix", nome: "Netflix", categoria: "video", valor: 39.9, moeda: "BRL", periodicidade: "mensal", renovacao: dataDaquiA(6), status: "ativa" },
    { id: "notion", nome: "Notion", categoria: "produtividade", valor: 10, moeda: "USD", periodicidade: "mensal", renovacao: dataDaquiA(10), status: "ativa" },
    { id: "icloud", nome: "iCloud+", categoria: "armazenamento", valor: 5.9, moeda: "BRL", periodicidade: "mensal", renovacao: dataDaquiA(15), status: "ativa" },
    { id: "alura", nome: "Alura", categoria: "educacao", valor: 360, moeda: "BRL", periodicidade: "anual", renovacao: dataDaquiA(200), status: "ativa" },
    { id: "disney", nome: "Disney+", categoria: "video", valor: 43.9, moeda: "BRL", periodicidade: "mensal", renovacao: dataDaquiA(-2), status: "inativa" },
  ];
}

function salvarAssinaturas(lista) {
  localStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(lista));
}

// Lê as assinaturas salvas. No primeiro acesso, grava os exemplos.
function carregarAssinaturas() {
  const texto = localStorage.getItem(CHAVE_ARMAZENAMENTO);

  if (texto === null) {
    const iniciais = criarDadosIniciais();
    salvarAssinaturas(iniciais);
    return iniciais;
  }

  try {
    const lista = JSON.parse(texto);
    return Array.isArray(lista) ? lista : [];
  } catch (erro) {
    console.error("Não foi possível ler as assinaturas salvas.", erro);
    return [];
  }
}

// ---------- Elementos da página ----------

// Cria um elemento com classe e texto opcionais
function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function criarAvatar(assinatura) {
  const cor = CORES_AVATAR[assinatura.categoria] || "escuro";
  const avatar = criarElemento("span", `avatar avatar-${cor}`, assinatura.nome.charAt(0).toUpperCase());
  avatar.setAttribute("aria-hidden", "true");
  return avatar;
}

function criarEtiquetaStatus(status) {
  const texto = status === "ativa" ? "Ativa" : "Inativa";
  return criarElemento("span", `status status-${status}`, texto);
}
