import { apiGetOne, apiGetList, apiPost, apiPatch } from "./client";
import { Pagamento, TipoPagamento, StatusPagamento } from "./types";

/** GET /api/pagamentos/id/{id} */
export function getPagamentoPorId(id: number): Promise<Pagamento> {
  return apiGetOne<Pagamento>(`/pagamentos/id/${id}`);
}

/** GET /api/pagamentos/usuario/all */
export function listarMeusPagamentos(): Promise<Pagamento[]> {
  return apiGetList<Pagamento>("/pagamentos/usuario/all");
}

/**
 * POST /api/pagamentos/create/{idPedido}?metodo_pagamento=PIX
 * Atenção: o método de pagamento vai como QUERY PARAM (nome em snake_case),
 * não no corpo. Normalmente não é preciso chamar isso manualmente — o
 * checkout() do pedido.ts já cria pedido + itens + pagamento numa vez só.
 */
export function criarPagamento(idPedido: number, metodoPagamento: TipoPagamento): Promise<Pagamento> {
  return apiPost<Pagamento>(`/pagamentos/create/${idPedido}?metodo_pagamento=${metodoPagamento}`, undefined);
}

/** PATCH /api/pagamentos/status/{id}?status=APROVADO — status também é query param aqui */
export function atualizarStatusPagamento(id: number, status: StatusPagamento): Promise<Pagamento> {
  return apiPatch<Pagamento>(`/pagamentos/status/${id}?status=${status}`);
}
