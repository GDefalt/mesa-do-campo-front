import { apiGetOne, apiGetList, apiGetPagina, apiPost, apiPatch, apiDelete, PaginaResultado } from "./client";
import { ItemPedido, StatusItemPedido } from "./types";

export function getItemPedidoPorId(id: number): Promise<ItemPedido> {
  return apiGetOne<ItemPedido>(`/item-pedido/unique/${id}`);
}

/** GET /api/item-pedido/pedido/{idPedido} — itens de um pedido específico */
export function listarItensDoPedido(idPedido: number): Promise<ItemPedido[]> {
  return apiGetList<ItemPedido>(`/item-pedido/pedido/${idPedido}`);
}

/**
 * GET /api/item-pedido/vendedor/{idVendedor} — itens vendidos por um
 * vendedor, usado em "Meu Negócio" para listar os pedidos recebidos.
 */
export function listarItensVendidos(idVendedor: number): Promise<ItemPedido[]> {
  return apiGetList<ItemPedido>(`/item-pedido/vendedor/${idVendedor}`);
}

/** Igual a listarItensVendidos, mas em lotes — usado em "Pedidos recebidos". */
export function listarItensVendidosPaginado(
  idVendedor: number,
  opts?: { lote?: number; limite?: number }
): Promise<PaginaResultado<ItemPedido>> {
  return apiGetPagina<ItemPedido>(`/item-pedido/vendedor/${idVendedor}`, opts);
}

/** POST /api/item-pedido/create — adiciona um item avulso a um pedido já existente */
export function criarItemPedido(dados: {
  idPedido: number;
  idProduto: number;
  quantidade: number;
}): Promise<ItemPedido> {
  return apiPost<ItemPedido>("/item-pedido/create", dados);
}

/** PATCH /api/item-pedido/quantidade/{id} — corpo: { "quantidade": N } */
export function atualizarQuantidadeItem(id: number, quantidade: number): Promise<ItemPedido> {
  return apiPatch<ItemPedido>(`/item-pedido/quantidade/${id}`, { quantidade });
}

/**
 * PATCH /api/item-pedido/status/{id} — corpo: { "status": "EM_TRANSITO" }
 * Só o vendedor do produto daquele item pode chamar isso.
 */
export function atualizarStatusItem(id: number, status: StatusItemPedido): Promise<ItemPedido> {
  return apiPatch<ItemPedido>(`/item-pedido/status/${id}`, { status });
}

export function deletarItemPedido(id: number): Promise<void> {
  return apiDelete(`/item-pedido/${id}`);
}
