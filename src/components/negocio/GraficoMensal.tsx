"use client";

import styles from "./GraficoMensal.module.css";
import { formatarPreco } from "../../lib/formatarPreco";

interface Mes {
  chave: string;
  rotulo: string;
  receita: number;
  quantidade: number;
  atual: boolean;
}

interface Props {
  meses: Mes[];
}

export default function GraficoMensal({ meses }: Props) {
  const maiorReceita = Math.max(1, ...meses.map((m) => m.receita));

  return (
    <div className={styles.grafico}>
      {meses.map((mes) => (
        <div className={styles.coluna} key={mes.chave}>
          <div className={styles.barraContainer}>
            <div
              className={`${styles.barra} ${mes.atual ? styles.barraAtual : ""}`}
              style={{ height: `${Math.max(3, (mes.receita / maiorReceita) * 100)}%` }}
              title={`${mes.rotulo}: ${formatarPreco(mes.receita)}`}
            >
              {mes.receita > 0 && <span className={styles.valorBarra}>{formatarPreco(mes.receita)}</span>}
            </div>
          </div>
          <span className={`${styles.rotuloMes} ${mes.atual ? styles.rotuloMesAtual : ""}`}>
            {mes.rotulo}
            {mes.atual && <span className={styles.marcadorAtual}>atual</span>}
          </span>
        </div>
      ))}
    </div>
  );
}
