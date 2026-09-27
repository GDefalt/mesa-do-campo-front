import { apiGetOne, apiGetList, apiPost, apiPut, apiDelete } from "./client";
import { CadastroVendedorResultado, VendedorDTO, VendedorCreate } from "./types";

/** GET /api/vendedor/auto — dados de vendedor do usuário autenticado.
 * Lança ApiError 404 se o cliente autenticado ainda não for vendedor. */
export function getVendedorAutenticado(idUsuarioAuth: number): Promise<VendedorDTO> {
  return apiGetOne<VendedorDTO>(`/vendedor/auto?idUsuarioAuth=${idUsuarioAuth}`);
}

export function listarVendedores(): Promise<VendedorDTO[]> {
  return apiGetList<VendedorDTO>("/vendedor/all", false);
}

/** POST /api/vendedor/create — cria ou reativa o perfil do cliente autenticado. */
export function criarVendedor(dados: VendedorCreate): Promise<CadastroVendedorResultado> {
  return apiPost<CadastroVendedorResultado>(`/vendedor/create?idUsuarioAuth=${dados.idVendedor}`, dados);
}

export function atualizarVendedor(dados: VendedorDTO): Promise<VendedorDTO> {
  return apiPut<VendedorDTO>(`/vendedor/update?idUsuarioAuth=${dados.idVendedor}`, dados);
}

/** DELETE /api/vendedor/{idVendedor} — desativa o perfil de vendedor, preservando os dados. */
export function deletarVendedor(idVendedor: number): Promise<void> {
  return apiDelete(`/vendedor/${idVendedor}?idUsuarioAuth=${idVendedor}`);
}
