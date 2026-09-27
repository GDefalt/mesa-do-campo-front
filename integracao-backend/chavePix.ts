import { apiGetOne, apiGetList, apiPost, apiPut, apiPatch, apiDelete } from "./client";
import { ChavePix } from "./types";

export function getChavePixPorId(id: number): Promise<ChavePix> {
  return apiGetOne<ChavePix>(`/chave-pix/unique/${id}`);
}

/** GET /api/chave-pix/auto — todas as chaves PIX do usuário autenticado */
export function listarMinhasChavesPix(): Promise<ChavePix[]> {
  return apiGetList<ChavePix>("/chave-pix/auto");
}

/** GET /api/chave-pix/active — chave PIX marcada como padrão */
export function getChavePixAtiva(): Promise<ChavePix> {
  return apiGetOne<ChavePix>("/chave-pix/active");
}

export function criarChavePix(dados: Omit<ChavePix, "id">): Promise<ChavePix> {
  return apiPost<ChavePix>("/chave-pix/create", dados);
}

export function atualizarChavePix(dados: ChavePix): Promise<ChavePix> {
  return apiPut<ChavePix>("/chave-pix/update", dados);
}

/** PATCH /api/chave-pix/active/{id} — define esta chave como padrão */
export function ativarChavePix(id: number): Promise<ChavePix> {
  return apiPatch<ChavePix>(`/chave-pix/active/${id}`);
}

export function desativarChavePix(id: number): Promise<void> {
  return apiPatch<void>(`/chave-pix/deactivate/${id}`);
}

export function deletarChavePix(id: number): Promise<void> {
  return apiDelete(`/chave-pix/${id}`);
}
