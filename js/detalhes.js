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

exibirMensagemGuardada(document.querySelector("#mensagem-sucesso"));

if (assinatura) {
  exibirDetalhes(assinatura);
} else {
  naoEncontrada.hidden = false;
}
