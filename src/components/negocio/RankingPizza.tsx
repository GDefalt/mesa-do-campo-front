"use client";

import styles from "./RankingPizza.module.css";

interface Fatia {
  nome: string;
  valor: number;
}

interface Props {
  dados: Fatia[];
}

const CORES = ["#2F7D32", "#6FBF73", "#E2A33D", "#1E5A21", "#B7862E"];

function paraCartesiano(cx: number, cy: number, raio: number, anguloGraus: number) {
  const anguloRad = ((anguloGraus - 90) * Math.PI) / 180;
  return { x: cx + raio * Math.cos(anguloRad), y: cy + raio * Math.sin(anguloRad) };
}

function descreverFatia(cx: number, cy: number, raio: number, anguloInicial: number, anguloFinal: number) {
  const inicio = paraCartesiano(cx, cy, raio, anguloFinal);
  const fim = paraCartesiano(cx, cy, raio, anguloInicial);
  const arcoGrande = anguloFinal - anguloInicial <= 180 ? "0" : "1";
  return ["M", cx, cy, "L", inicio.x, inicio.y, "A", raio, raio, 0, arcoGrande, 0, fim.x, fim.y, "Z"].join(" ");
}

export default function RankingPizza({ dados }: Props) {
  const total = dados.reduce((soma, item) => soma + item.valor, 0);

  if (total === 0) {
    return <p className={styles.vazio}>Sem dados suficientes para o gráfico.</p>;
  }

  let anguloAcumulado = 0;
  const fatias = dados.map((item, indice) => {
    const percentual = item.valor / total;
    const anguloInicial = anguloAcumulado;
    const anguloFinal = anguloAcumulado + percentual * 360;
    anguloAcumulado = anguloFinal;

    return {
      ...item,
      percentual,
      cor: CORES[indice % CORES.length],
      caminho:
        dados.length === 1
          ? null // fatia única = círculo cheio
          : descreverFatia(50, 50, 48, anguloInicial, anguloFinal),
    };
  });

  return (
    <div className={styles.wrapper}>
      <svg viewBox="0 0 100 100" className={styles.svg} xmlns="http://www.w3.org/2000/svg">
        {fatias.map((fatia) =>
          fatia.caminho ? (
            <path key={fatia.nome} d={fatia.caminho} fill={fatia.cor} stroke="var(--color-surface)" strokeWidth="1" />
          ) : (
            <circle key={fatia.nome} cx="50" cy="50" r="48" fill={fatia.cor} />
          )
        )}
      </svg>

      <div className={styles.legenda}>
        {fatias.map((fatia) => (
          <div className={styles.legendaItem} key={fatia.nome}>
            <span className={styles.legendaCor} style={{ background: fatia.cor }} />
            <span className={styles.legendaNome}>{fatia.nome}</span>
            <span className={styles.legendaPercentual}>{Math.round(fatia.percentual * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
