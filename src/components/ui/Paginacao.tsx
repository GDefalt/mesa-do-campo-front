"use client";

import styles from "./Paginacao.module.css";

interface Props {
  paginaAtual: number;
  totalPaginas: number;
  totalItens: number;
  onMudarPagina: (pagina: number) => void;
}

function paginasVisiveis(paginaAtual: number, totalPaginas: number): Array<number | "reticencias"> {
  if (totalPaginas <= 7) {
    return Array.from({ length: totalPaginas }, (_, indice) => indice + 1);
  }

  const paginas = new Set([1, totalPaginas]);
  for (let pagina = paginaAtual - 1; pagina <= paginaAtual + 1; pagina++) {
    if (pagina > 1 && pagina < totalPaginas) paginas.add(pagina);
  }

  const ordenadas = Array.from(paginas).sort((a, b) => a - b);
  const resultado: Array<number | "reticencias"> = [];

  ordenadas.forEach((pagina, indice) => {
    const anterior = ordenadas[indice - 1];
    if (anterior != null && pagina - anterior > 1) resultado.push("reticencias");
    resultado.push(pagina);
  });

  return resultado;
}

export default function Paginacao({ paginaAtual, totalPaginas, totalItens, onMudarPagina }: Props) {
  if (totalPaginas <= 1) return null;

  const paginas = paginasVisiveis(paginaAtual, totalPaginas);

  return (
    <div className={styles.container}>
      <span className={styles.contagem}>
        {totalItens} item(ns) — lote {paginaAtual} de {totalPaginas}
      </span>

      <div className={styles.botoes}>
        <button
          className={styles.btn}
          onClick={() => onMudarPagina(paginaAtual - 1)}
          disabled={paginaAtual <= 1}
        >
          ← Anterior
        </button>

        <div className={styles.numeros} aria-label="Páginas">
          {paginas.map((pagina, indice) =>
            pagina === "reticencias" ? (
              <span className={styles.reticencias} key={`reticencias-${indice}`} aria-hidden="true">
                …
              </span>
            ) : (
              <button
                className={`${styles.pagina} ${pagina === paginaAtual ? styles.paginaAtiva : ""}`}
                key={pagina}
                onClick={() => onMudarPagina(pagina)}
                aria-label={`Ir para a página ${pagina}`}
                aria-current={pagina === paginaAtual ? "page" : undefined}
              >
                {pagina}
              </button>
            )
          )}
        </div>

        <button
          className={styles.btn}
          onClick={() => onMudarPagina(paginaAtual + 1)}
          disabled={paginaAtual >= totalPaginas}
        >
          Próximo →
        </button>
      </div>
    </div>
  );
}
