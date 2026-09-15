import { apiGetOne, apiGetList, apiPost, apiPut, apiPatch, apiDelete } from "./client";
import { Cartao } from "./types";

export function getCartaoDebitoPorId(id: number): Promise<Cartao> {
  return apiGetOne<Cartao>(`/cartao-debito/unique/${id}`);
}

/** GET /api/cartao-debito/auto — todos os cartões de débito do usuário autenticado */
export function listarMeusCartoesDebito(): Promise<Cartao[]> {
  return apiGetList<Cartao>("/cartao-debito/auto");
}

/** GET /api/cartao-debito/active — cartão de débito marcado como padrão */
export function getCartaoDebitoAtivo(): Promise<Cartao> {
  return apiGetOne<Cartao>("/cartao-debito/active");
}

export function criarCartaoDebito(dados: Omit<Cartao, "id">): Promise<Cartao> {
  return apiPost<Cartao>("/cartao-debito/create", dados);
}

export function atualizarCartaoDebito(dados: Cartao): Promise<Cartao> {
  return apiPut<Cartao>("/cartao-debito/update", dados);
}

/** PATCH /api/cartao-debito/active/{id} — define este cartão como padrão */
export function ativarCartaoDebito(id: number): Promise<Cartao> {
  return apiPatch<Cartao>(`/cartao-debito/active/${id}`);
}

export function desativarCartaoDebito(id: number): Promise<void> {
  return apiPatch<void>(`/cartao-debito/deactivate/${id}`);
}

export function deletarCartaoDebito(id: number): Promise<void> {
  return apiDelete(`/cartao-debito/${id}`);
}
