"use client";

import styles from "./Paginacao.module.css";

interface Props {
  paginaAtual: number;
  totalPaginas: number;
  totalItens: number;
  onMudarPagina: (pagina: number) => void;
}

export default function Paginacao({ paginaAtual, totalPaginas, totalItens, onMudarPagina }: Props) {
  if (totalPaginas <= 1) return null;

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

        <span className={styles.pagina}>{paginaAtual}</span>

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
