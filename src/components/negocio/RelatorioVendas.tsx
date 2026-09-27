"use client";

import { useMemo, useState } from "react";
import styles from "./RelatorioVendas.module.css";
import RankingPizza from "./RankingPizza";
import GraficoMensal from "./GraficoMensal";
import { useItensVendidos } from "../../hooks/useItensVendidos";
import { formatarPreco } from "../../lib/formatarPreco";

interface Props {
  idVendedor: number;
}

interface LinhaProduto {
  nome: string;
  quantidade: number;
  receita: number;
}

interface LinhaMes {
  chave: string;
  rotulo: string;
  quantidade: number;
  receita: number;
  atual: boolean;
}

const MESES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

const MAX_MESES_INTERVALO = 36;

function chaveDoMes(dataIso?: string): string | null {
  if (!dataIso) return null;
  const data = new Date(dataIso);
  if (isNaN(data.getTime())) return null;
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

function rotuloDoMes(chave: string): string {
  const [ano, mes] = chave.split("-").map(Number);
  return `${MESES[mes - 1]}/${ano}`;
}

function gerarIntervaloMeses(inicio: string, fim: string): string[] {
  const [anoIni, mesIni] = inicio.split("-").map(Number);
  const [anoFim, mesFim] = fim.split("-").map(Number);

  const chaves: string[] = [];
  let ano = anoIni;
  let mes = mesIni;

  while (ano < anoFim || (ano === anoFim && mes <= mesFim)) {
    chaves.push(`${ano}-${String(mes).padStart(2, "0")}`);
    mes++;
    if (mes > 12) {
      mes = 1;
      ano++;
    }
    if (chaves.length > MAX_MESES_INTERVALO) break;
  }

  return chaves;
}

const hoje = new Date();
const anoAtual = hoje.getFullYear();
const chaveMesAtual = `${anoAtual}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;

export default function RelatorioVendas({ idVendedor }: Props) {
  const { itens, produtos, carregando, erro } = useItensVendidos(idVendedor);
  const [gerando, setGerando] = useState(false);

  const [mesInicio, setMesInicio] = useState(`${anoAtual}-01`);
  const [mesFim, setMesFim] = useState(`${anoAtual}-12`);

  const intervaloInvalido = mesInicio > mesFim;

  const itensValidos = useMemo(() => itens.filter((item) => item.status !== "CANCELADO"), [itens]);

  // Só considera, nos gráficos e no ranking, os itens dentro do período selecionado.
  const itensNoPeriodo = useMemo(() => {
    if (intervaloInvalido) return [];
    return itensValidos.filter((item) => {
      const chave = chaveDoMes(item.dataCompra);
      return chave != null && chave >= mesInicio && chave <= mesFim;
    });
  }, [itensValidos, mesInicio, mesFim, intervaloInvalido]);

  const receitaTotal = useMemo(
    () => itensValidos.reduce((soma, item) => soma + item.precoUnit * item.quantidade, 0),
    [itensValidos]
  );

  const unidadesTotais = useMemo(
    () => itensValidos.reduce((soma, item) => soma + item.quantidade, 0),
    [itensValidos]
  );

  // Top 5 produtos mais vendidos (por unidades), dentro do período selecionado.
  const top5 = useMemo(() => {
    const mapa: Record<number, LinhaProduto> = {};

    itensNoPeriodo.forEach((item) => {
      const nome = produtos[item.idProduto]?.nome ?? `Produto #${item.idProduto}`;
      if (!mapa[item.idProduto]) mapa[item.idProduto] = { nome, quantidade: 0, receita: 0 };
      mapa[item.idProduto].quantidade += item.quantidade;
      mapa[item.idProduto].receita += item.precoUnit * item.quantidade;
    });

    return Object.values(mapa)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
  }, [itensNoPeriodo, produtos]);

  // Renda mensal: TODOS os meses do período aparecem, mesmo sem vendas.
  const rendaMensal: LinhaMes[] = useMemo(() => {
    if (intervaloInvalido) return [];

    const mapa: Record<string, { quantidade: number; receita: number }> = {};

    itensNoPeriodo.forEach((item) => {
      const chave = chaveDoMes(item.dataCompra);
      if (!chave) return;
      if (!mapa[chave]) mapa[chave] = { quantidade: 0, receita: 0 };
      mapa[chave].quantidade += item.quantidade;
      mapa[chave].receita += item.precoUnit * item.quantidade;
    });

    return gerarIntervaloMeses(mesInicio, mesFim).map((chave) => ({
      chave,
      rotulo: rotuloDoMes(chave),
      quantidade: mapa[chave]?.quantidade ?? 0,
      receita: mapa[chave]?.receita ?? 0,
      atual: chave === chaveMesAtual,
    }));
  }, [itensNoPeriodo, mesInicio, mesFim, intervaloInvalido]);

  function gerarRelatorio() {
    setGerando(true);

    const linhas = [
      ["Relatório de vendas — Mesa do Campo"],
      [`Período: ${mesInicio} a ${mesFim}`],
      [],
      ["Top 5 produtos", "Quantidade vendida", "Receita"],
      ...top5.map((p) => [p.nome, String(p.quantidade), p.receita.toFixed(2)]),
      [],
      ["Renda mensal", "Unidades", "Receita"],
      ...rendaMensal.map((m) => [m.rotulo, String(m.quantidade), m.receita.toFixed(2)]),
      [],
      ["Renda total (todo o histórico)", String(unidadesTotais), receitaTotal.toFixed(2)],
    ];

    const csv = linhas.map((linha) => linha.join(";")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio-de-vendas-mesa-do-campo.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => setGerando(false), 1200);
  }

  return (
    <div>
      <div className={styles.cabecalho}>
        <div>
          <h2 className={styles.titulo}>Relatório de vendas</h2>
          <p className={styles.subtitulo}>Desempenho dos seus produtos com base nos itens vendidos.</p>
        </div>

        <button
          className={styles.btnGerar}
          onClick={gerarRelatorio}
          disabled={gerando || itensValidos.length === 0}
        >
          {gerando ? "Gerando..." : "Gerar Relatório"}
        </button>
      </div>

      {carregando ? (
        <p className={styles.subtitulo}>Carregando vendas...</p>
      ) : erro ? (
        <p className={styles.subtitulo}>{erro}</p>
      ) : itensValidos.length === 0 ? (
        <p className={styles.subtitulo}>Você ainda não vendeu nenhum produto.</p>
      ) : (
        <>
          {/* Renda total do negócio (sempre considera todo o histórico) */}
          <div className={styles.rendaTotalBloco}>
            <div>
              <span className={styles.rendaTotalLabel}>Renda total do negócio</span>
              <strong className={styles.rendaTotalValor}>{formatarPreco(receitaTotal)}</strong>
            </div>
            <span className={styles.rendaTotalUnidades}>{unidadesTotais} unidade(s) vendida(s)</span>
          </div>

          {/* Filtro geral de período */}
          <div className={styles.filtroPeriodo}>
            <label className={styles.filtroCampo}>
              De
              <input type="month" value={mesInicio} onChange={(e) => setMesInicio(e.target.value)} />
            </label>
            <label className={styles.filtroCampo}>
              Até
              <input type="month" value={mesFim} onChange={(e) => setMesFim(e.target.value)} />
            </label>
          </div>

          {intervaloInvalido ? (
            <p className={styles.subtitulo}>O mês inicial precisa ser anterior (ou igual) ao mês final.</p>
          ) : (
            <>
              {/* Top 5 produtos mais vendidos + gráfico de pizza */}
              <div className={styles.blocoSecao}>
                <h3 className={styles.tituloBloco}>Top 5 produtos mais vendidos</h3>

                {top5.length === 0 ? (
                  <p className={styles.subtitulo}>Nenhuma venda no período selecionado.</p>
                ) : (
                  <div className={styles.duasColunas}>
                    <div className={styles.tabela}>
                      <div className={styles.linhaCabecalho}>
                        <span>#</span>
                        <span>Produto</span>
                        <span>Un.</span>
                        <span>Receita</span>
                      </div>

                      {top5.map((produto, indice) => (
                        <div className={styles.linha} key={produto.nome}>
                          <span className={`${styles.posicao} ${indice < 3 ? styles.posicaoTop : ""}`}>
                            {indice + 1}º
                          </span>
                          <span className={styles.nomeProduto}>{produto.nome}</span>
                          <span>{produto.quantidade}</span>
                          <span className={styles.valorDestaque}>{formatarPreco(produto.receita)}</span>
                        </div>
                      ))}
                    </div>

                    <RankingPizza
                      dados={top5.map((p) => ({ nome: p.nome, valor: p.quantidade }))}
                    />
                  </div>
                )}
              </div>

              {/* Renda mensal — todos os meses do período, com o mês atual em destaque */}
              <div className={styles.blocoSecao}>
                <h3 className={styles.tituloBloco}>Renda mensal</h3>
                <GraficoMensal meses={rendaMensal} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
