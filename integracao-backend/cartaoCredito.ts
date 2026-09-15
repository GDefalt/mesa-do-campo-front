import { apiGetOne, apiGetList, apiPost, apiPut, apiPatch, apiDelete } from "./client";
import { Cartao } from "./types";

export function getCartaoCreditoPorId(id: number): Promise<Cartao> {
  return apiGetOne<Cartao>(`/cartao-credito/unique/${id}`);
}

/** GET /api/cartao-credito/auto — todos os cartões de crédito do usuário autenticado */
export function listarMeusCartoesCredito(): Promise<Cartao[]> {
  return apiGetList<Cartao>("/cartao-credito/auto");
}

/** GET /api/cartao-credito/active — cartão de crédito marcado como padrão */
export function getCartaoCreditoAtivo(): Promise<Cartao> {
  return apiGetOne<Cartao>("/cartao-credito/active");
}

export function criarCartaoCredito(dados: Omit<Cartao, "id">): Promise<Cartao> {
  return apiPost<Cartao>("/cartao-credito/create", dados);
}

export function atualizarCartaoCredito(dados: Cartao): Promise<Cartao> {
  return apiPut<Cartao>("/cartao-credito/update", dados);
}

/** PATCH /api/cartao-credito/active/{id} — define este cartão como padrão */
export function ativarCartaoCredito(id: number): Promise<Cartao> {
  return apiPatch<Cartao>(`/cartao-credito/active/${id}`);
}

export function desativarCartaoCredito(id: number): Promise<void> {
  return apiPatch<void>(`/cartao-credito/deactivate/${id}`);
}

export function deletarCartaoCredito(id: number): Promise<void> {
  return apiDelete(`/cartao-credito/${id}`);
}
