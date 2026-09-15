import { apiGetOne, apiGetList, apiGetPagina, apiPost, apiPut, apiDelete, PaginaResultado } from "./client";
import { Produto, CategoriaProduto } from "./types";

/** GET /api/produto/unique/{id} — catálogo é público, não exige autenticação */
export function getProdutoPorId(id: number): Promise<Produto> {
  return apiGetOne<Produto>(`/produto/unique/${id}`, false);
}

/** GET /api/produto/vendedor/{idVendedor} */
export function listarProdutosPorVendedor(idVendedor: number): Promise<Produto[]> {
  return apiGetList<Produto>(`/produto/vendedor/${idVendedor}`, false);
}

/** Igual a listarProdutosPorVendedor, mas em lotes — para telas com paginação. */
export function listarProdutosPorVendedorPaginado(
  idVendedor: number,
  opts?: { lote?: number; limite?: number }
): Promise<PaginaResultado<Produto>> {
  return apiGetPagina<Produto>(`/produto/vendedor/${idVendedor}`, { ...opts, autenticado: false });
}

/** GET /api/produto/all */
export function listarTodosProdutos(): Promise<Produto[]> {
  return apiGetList<Produto>("/produto/all", false);
}

/** Igual a listarTodosProdutos, mas em lotes — usado no Catálogo. */
export function listarTodosProdutosPaginado(opts?: {
  lote?: number;
  limite?: number;
}): Promise<PaginaResultado<Produto>> {
  return apiGetPagina<Produto>("/produto/all", { ...opts, autenticado: false });
}

/** GET /api/produto/categoria/{categoria} */
export function listarProdutosPorCategoria(categoria: CategoriaProduto): Promise<Produto[]> {
  return apiGetList<Produto>(`/produto/categoria/${categoria}`, false);
}

/** Igual a listarProdutosPorCategoria, mas em lotes. */
export function listarProdutosPorCategoriaPaginado(
  categoria: CategoriaProduto,
  opts?: { lote?: number; limite?: number }
): Promise<PaginaResultado<Produto>> {
  return apiGetPagina<Produto>(`/produto/categoria/${categoria}`, { ...opts, autenticado: false });
}

/** POST /api/produto/create — apenas o próprio vendedor pode cadastrar seus produtos */
export function criarProduto(dados: Omit<Produto, "id">): Promise<Produto> {
  return apiPost<Produto>("/produto/create", dados);
}

export function atualizarProduto(dados: Produto): Promise<Produto> {
  return apiPut<Produto>("/produto/update", dados);
}

export function deletarProduto(id: number): Promise<void> {
  return apiDelete(`/produto/${id}`);
}
