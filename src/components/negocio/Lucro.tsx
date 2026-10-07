"use client";

import { useEffect, useState } from "react";
import styles from "./Lucro.module.css";
import { formatarPreco } from "../../lib/formatarPreco";
import { ApiError, listarTopProdutos } from "@integracao-backend";

interface Props {
  idVendedor: number;
}

// O back-end não guarda custo de produção — esta margem é uma estimativa
// aplicada à receita consolidada recebida da API.
const MARGEM_CUSTO_ESTIMADA = 0.62;

export default function Lucro({ idVendedor }: Props) {
  const [receitaTotal, setReceitaTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro("");

    listarTopProdutos(1)
      .then((produtos) => {
        if (!cancelado) setReceitaTotal(produtos.find((produto) => produto.nome === "TOTAL")?.valorVendido ?? 0);
      })
      .catch((err) => {
        if (!cancelado) setErro(err instanceof ApiError ? err.message : "Não foi possível carregar a análise de lucro.");
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idVendedor]);

  if (carregando) return <p className={styles.subtitulo}>Carregando análise...</p>;
  if (erro) return <p className={styles.subtitulo}>{erro}</p>;

  const custosEstimados = receitaTotal * MARGEM_CUSTO_ESTIMADA;
  const lucroLiquido = receitaTotal - custosEstimados;
  const margem = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;

  return (
    <div>
      <h2 className={styles.titulo}>Análise de lucro</h2>
      <p className={styles.subtitulo}>Receita consolidada, com custos estimados (o custo de produção ainda não é registrado).</p>

      <div className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.label}>Receita total</span>
          <strong className={styles.valor}>{formatarPreco(receitaTotal)}</strong>
        </div>

        <div className={styles.card}>
          <span className={styles.label}>Custos estimados</span>
          <strong className={styles.valor}>{formatarPreco(custosEstimados)}</strong>
        </div>

        <div className={`${styles.card} ${styles.cardDestaque}`}>
          <span className={styles.label}>Lucro líquido estimado</span>
          <strong className={styles.valor}>{formatarPreco(lucroLiquido)}</strong>
          <span className={styles.margem}>Margem de {margem.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
