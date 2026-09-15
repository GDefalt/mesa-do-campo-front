import { apiGetOne, apiGetList, apiPost, apiPut, apiDelete } from "./client";
import { Avaliacao } from "./types";

/**
 * Atenção: a Avaliacao no back-end avalia o VENDEDOR (idVendedor), não um
 * produto específico. Para avaliar a partir de uma compra, use o
 * idVendedor do produto comprado (Produto.idVendedor).
 */

export function getAvaliacaoPorId(id: number): Promise<Avaliacao> {
  return apiGetOne<Avaliacao>(`/avaliacao/unique/${id}`, false);
}

/** GET /api/avaliacao/vendedor/{idVendedor} — todas as avaliações recebidas por um vendedor */
export function listarAvaliacoesDoVendedor(idVendedor: number): Promise<Avaliacao[]> {
  return apiGetList<Avaliacao>(`/avaliacao/vendedor/${idVendedor}`, false);
}

/** GET /api/avaliacao/cliente/{idCliente} — todas as avaliações feitas por um cliente */
export function listarAvaliacoesDoCliente(idCliente: number): Promise<Avaliacao[]> {
  return apiGetList<Avaliacao>(`/avaliacao/cliente/${idCliente}`, false);
}

/** GET /api/avaliacao/auto — avaliações recebidas pelo vendedor autenticado */
export function listarMinhasAvaliacoesRecebidas(): Promise<Avaliacao[]> {
  return apiGetList<Avaliacao>("/avaliacao/auto");
}

export function listarTodasAvaliacoes(): Promise<Avaliacao[]> {
  return apiGetList<Avaliacao>("/avaliacao/all", false);
}

/** POST /api/avaliacao/create — idCliente deve ser o do usuário autenticado; não é permitido se autoavaliar */
export function criarAvaliacao(dados: {
  idVendedor: number;
  idCliente: number;
  nota: number;
  descricao?: string;
}): Promise<Avaliacao> {
  return apiPost<Avaliacao>("/avaliacao/create", dados);
}

export function atualizarAvaliacao(dados: Avaliacao): Promise<Avaliacao> {
  return apiPut<Avaliacao>("/avaliacao/update", dados);
}

export function deletarAvaliacao(id: number): Promise<void> {
  return apiDelete(`/avaliacao/${id}`);
}
