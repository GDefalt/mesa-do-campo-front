import { apiGetList } from "./client";
import { Produto, TopProduto, VendaMensal } from "./types";

/**
 * GET /api/negocio/produto/{nome} — busca somente nos produtos do vendedor
 * autenticado. Diferente do catálogo, esta rota exige autenticação.
 */
export function buscarMeusProdutosPorNome(nome: string): Promise<Produto[]> {
  return apiGetList<Produto>(`/negocio/produto/${encodeURIComponent(nome)}`);
}

/** GET /api/negocio/top_produtos/{quant} — ranking e total de vendas do vendedor autenticado. */
export function listarTopProdutos(quantidade = 5): Promise<TopProduto[]> {
  return apiGetList<TopProduto>(`/negocio/top_produtos/${quantidade}`);
}

/**
 * GET /api/negocio/vendas_mensais — valores mensais do vendedor autenticado.
 * As datas devem estar em YYYY-MM-DD, inclusive para meses sem vendas.
 */
export function listarVendasMensais(dataInicio: string, dataFim: string): Promise<VendaMensal[]> {
  const params = new URLSearchParams({ dataInicio, dataFim });
  return apiGetList<VendaMensal>(`/negocio/vendas_mensais?${params.toString()}`);
}
