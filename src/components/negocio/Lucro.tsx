"use client";

import { useMemo } from "react";
import styles from "./Lucro.module.css";
import { useItensVendidos } from "../../hooks/useItensVendidos";
import { formatarPreco } from "../../lib/formatarPreco";

interface Props {
  idVendedor: number;
}

// O back-end não guarda custo de produção — esta margem é só uma estimativa
// ilustrativa aplicada sobre a receita real, não um valor vindo do servidor.
const MARGEM_CUSTO_ESTIMADA = 0.62;

export default function Lucro({ idVendedor }: Props) {
  const { itens, carregando, erro } = useItensVendidos(idVendedor);

  const receitaTotal = useMemo(
    () =>
      itens
        .filter((item) => item.status !== "CANCELADO")
        .reduce((soma, item) => soma + item.precoUnit * item.quantidade, 0),
    [itens]
  );

  if (carregando) return <p className={styles.subtitulo}>Carregando...</p>;
  if (erro) return <p className={styles.subtitulo}>{erro}</p>;

  const custosEstimados = receitaTotal * MARGEM_CUSTO_ESTIMADA;
  const lucroLiquido = receitaTotal - custosEstimados;
  const margem = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;

  return (
    <div>
      <h2 className={styles.titulo}>Análise de lucro</h2>
      <p className={styles.subtitulo}>
        Receita real, com custos estimados (o back-end ainda não registra o custo de produção).
      </p>

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
          <span className={styles.label}>Lucro líquido (estimado)</span>
          <strong className={styles.valor}>{formatarPreco(lucroLiquido)}</strong>
          <span className={styles.margem}>Margem de {margem.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}
