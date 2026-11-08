// ==========================================================
// SubTrack — confirmação de exclusão
// ==========================================================

const confirmacao = document.querySelector("#confirmacao-exclusao");
const botaoExcluir = document.querySelector("#botao-excluir");

const id = obterIdDaUrl();
const assinatura = buscarAssinatura(id);

function exibirConfirmacao(assinatura) {
  const periodo = assinatura.periodicidade === "anual" ? "por ano" : "por mês";

  document.title = `Excluir ${assinatura.nome} | SubTrack — Controle de Assinaturas`;
  document.querySelector("#excluir-nome").textContent = assinatura.nome;
  confirmacao.querySelector('[data-campo="nome"]').textContent = assinatura.nome;
  confirmacao.querySelector('[data-campo="categoria"]').textContent = CATEGORIAS[assinatura.categoria];
  confirmacao.querySelector('[data-campo="valor"]').textContent =
    `${formatarMoeda(assinatura.valor, assinatura.moeda)} ${periodo}`;
  document.querySelector("#link-cancelar").href = `detalhes.html?id=${encodeURIComponent(assinatura.id)}`;

  confirmacao.hidden = false;
}

botaoExcluir.addEventListener("click", () => {
  const restantes = carregarAssinaturas().filter((item) => item.id !== id);
  salvarAssinaturas(restantes);
  guardarMensagem(`${assinatura.nome} foi excluída da sua lista.`);
  window.location.href = "../index.html";
});

if (assinatura) {
  exibirConfirmacao(assinatura);
} else {
  document.querySelector("#nao-encontrada").hidden = false;
}
