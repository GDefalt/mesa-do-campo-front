"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./RelatorioVendas.module.css";
import RankingPizza from "./RankingPizza";
import GraficoMensal from "./GraficoMensal";
import { listarProdutosPorVendedor, listarTopProdutos, listarVendasMensais, Produto, TopProduto, VendaMensal } from "@integracao-backend";
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
  const [gerando, setGerando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [topProdutosApi, setTopProdutosApi] = useState<TopProduto[]>([]);
  const [vendasMensaisApi, setVendasMensaisApi] = useState<VendaMensal[]>([]);
  const [meusProdutos, setMeusProdutos] = useState<Produto[]>([]);

  // Por padrão, inicializa sempre com o ano atual
  const [mesInicio, setMesInicio] = useState(`${anoAtual}-01`);
  const [mesFim, setMesFim] = useState(`${anoAtual}-12`);

  const intervaloInvalido = mesInicio > mesFim;

  // Busca os dados do back-end conforme o período selecionado
  useEffect(() => {
    if (intervaloInvalido) return;

    let cancelado = false;
    setCarregando(true);
    setErro(null);

    // Calcula as datas em YYYY-MM-DD para o back-end
    const [anoF, mesF] = mesFim.split("-").map(Number);
    const ultimoDia = new Date(anoF, mesF, 0).getDate();
    const dataInicio = `${mesInicio}-01`;
    const dataFim = `${mesFim}-${String(ultimoDia).padStart(2, "0")}`;

    Promise.all([
      listarTopProdutos(5),
      listarVendasMensais(dataInicio, dataFim),
      listarProdutosPorVendedor(idVendedor),
    ])
      .then(([topRes, mensaisRes, produtosRes]) => {
        if (!cancelado) {
          console.log("Top produtos recebidos:", topRes);
          console.log("Vendas mensais recebidas:", mensaisRes);
          console.log("Produtos do vendedor recebidos:", produtosRes);

          setTopProdutosApi(topRes || []);
          setVendasMensaisApi(mensaisRes || []);
          setMeusProdutos(produtosRes || []);
        }
      })
      .catch((err) => {
        if (!cancelado) {
          console.error("Erro ao carregar dados do relatório:", err);
          setErro(err?.message || "Erro ao carregar dados do relatório.");
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCarregando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [idVendedor, mesInicio, mesFim, intervaloInvalido]);

  // Mapeia o Top 5 retornado do back-end, ignorando o objeto de "TOTAL"
  const top5: LinhaProduto[] = useMemo(() => {
    const produtosReais = topProdutosApi.filter(
      (item) => item.id !== 0 && item.nome !== "TOTAL" && item.nome !== "Total"
    );

    return produtosReais.slice(0, 5).map((item) => ({
      nome: item.nome ?? "",
      quantidade: Number(item.quantidade ?? (item as any).quant_vendida ?? 0),
      receita: Number(item.valorVendido ?? (item as any).valor_vendido ?? (item as any).receita ?? 0),
    }));
  }, [topProdutosApi]);

  // Localiza o objeto de TOTAL na última linha de topProdutosApi (id: 0 ou nome: 'TOTAL')
  const linhaTotalGeral = useMemo(() => {
    if (topProdutosApi.length === 0) return null;
    return (
      topProdutosApi.find(
        (item) => item.id === 0 || item.nome === "TOTAL" || item.nome === "Total"
      ) ?? topProdutosApi[topProdutosApi.length - 1]
    );
  }, [topProdutosApi]);

  // Extrai a receita total diretamente da linha TOTAL
  const receitaTotal = useMemo(() => {
    if (!linhaTotalGeral) return 0;
    return Number(
      linhaTotalGeral.valorVendido ??
        (linhaTotalGeral as any).valor_vendido ??
        (linhaTotalGeral as any).receita ??
        0
    );
  }, [linhaTotalGeral]);

  // Extrai o total de unidades diretamente da linha TOTAL
  const unidadesTotais = useMemo(() => {
    if (!linhaTotalGeral) return 0;
    return Number(
      linhaTotalGeral.quantidade ??
        (linhaTotalGeral as any).quant_vendida ??
        0
    );
  }, [linhaTotalGeral]);

  // Calcula os dados para o gráfico de pizza incluindo a fatia "Outros"
  const dadosPizza = useMemo(() => {
    const baseDados = top5.map((p) => ({ nome: p.nome, valor: p.quantidade }));

    if (linhaTotalGeral) {
      const totalGeral = Number(
        linhaTotalGeral.quantidade ?? (linhaTotalGeral as any).quant_vendida ?? 0
      );
      const totalTop5 = top5.reduce((soma, p) => soma + p.quantidade, 0);
      const quantidadeOutros = totalGeral - totalTop5;

      if (quantidadeOutros > 0) {
        baseDados.push({ nome: "Outros", valor: quantidadeOutros });
      }
    }

    return baseDados;
  }, [top5, linhaTotalGeral]);

  // Mapeia a renda mensal garantindo a exibição dos meses do intervalo
  const rendaMensal: LinhaMes[] = useMemo(() => {
    if (intervaloInvalido) return [];

    const mapa: Record<string, { quantidade: number; receita: number }> = {};

    vendasMensaisApi.forEach((item) => {
      let chave: string | null = null;

      if (item.ano && item.mes) {
        const m = String(item.mes).padStart(2, "0");
        chave = `${item.ano}-${m}`;
      } else if ((item as any).chave) {
        chave = String((item as any).chave).substring(0, 7);
      } else if ((item as any).mes && typeof (item as any).mes === "string") {
        chave = (item as any).mes.substring(0, 7);
      }

      if (!chave || chave.length < 7) return;

      const qtd = (item as any).quantidade ?? (item as any).quant_vendida ?? 0;
      const rec = item.valorVendido ?? (item as any).valor_vendido ?? (item as any).receita ?? 0;

      if (!mapa[chave]) {
        mapa[chave] = { quantidade: 0, receita: 0 };
      }
      mapa[chave].quantidade += Number(qtd);
      mapa[chave].receita += Number(rec);
    });

    return gerarIntervaloMeses(mesInicio, mesFim).map((chave) => ({
      chave,
      rotulo: rotuloDoMes(chave),
      quantidade: mapa[chave]?.quantidade ?? 0,
      receita: mapa[chave]?.receita ?? 0,
      atual: chave === chaveMesAtual,
    }));
  }, [vendasMensaisApi, mesInicio, mesFim, intervaloInvalido]);

  const semVendas = top5.length === 0 && receitaTotal === 0;

  function gerarRelatorio() {
    setGerando(true);

    const linhas = [
      ["Relatório de vendas — Mesa do Campo"],
      [`Período: ${mesInicio} a ${mesFim}`],
      [],
      ["Top 5 produtos mais vendidos", "Quantidade vendida", "Receita"],
      ...top5.map((p) => [p.nome, String(p.quantidade), p.receita.toFixed(2)]),
      [],
      ["Renda mensal", "Unidades", "Receita"],
      ...rendaMensal.map((m) => [m.rotulo, String(m.quantidade), m.receita.toFixed(2)]),
      [],
      ["Renda total (todo o histórico)", String(unidadesTotais), receitaTotal.toFixed(2)],
      [],
      ["Catálogo de Produtos do Vendedor"],
      ["ID", "Nome do Produto", "Preço Unitário (R$)", "Estoque Atual", "Categoria"],
      ...meusProdutos.map((prod) => [
        String(prod.id),
        prod.nome,
        prod.preco ? prod.preco.toFixed(2) : "0.00",
        String(prod.quantidade ?? 0),
        prod.categoria ?? "",
      ]),
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
          disabled={gerando || semVendas}
        >
          {gerando ? "Gerando..." : "Gerar Relatório"}
        </button>
      </div>

      {carregando ? (
        <p className={styles.subtitulo}>Carregando vendas...</p>
      ) : erro ? (
        <p className={styles.subtitulo}>{erro}</p>
      ) : semVendas ? (
        <p className={styles.subtitulo}>Você ainda não vendeu nenhum produto.</p>
      ) : (
        <>
          {/* Renda total do negócio (obtida diretamente do objeto TOTAL de TopProdutos) */}
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

                    <RankingPizza dados={dadosPizza} />
                  </div>
                )}
              </div>

              {/* Renda mensal */}
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