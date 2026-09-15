import { apiGetOne, apiGetList, apiPost, apiPut, apiDelete } from "./client";
import { VendedorDTO, VendedorCreate } from "./types";

/** GET /api/vendedor/auto — dados de vendedor do usuário autenticado.
 * Lança ApiError 404 se o cliente autenticado ainda não for vendedor. */
export function getVendedorAutenticado(): Promise<VendedorDTO> {
  return apiGetOne<VendedorDTO>("/vendedor/auto");
}

export function listarVendedores(): Promise<VendedorDTO[]> {
  return apiGetList<VendedorDTO>("/vendedor/all", false);
}

/** POST /api/vendedor/create — idVendedor deve ser o id do próprio cliente autenticado */
export function criarVendedor(dados: VendedorCreate): Promise<VendedorDTO> {
  return apiPost<VendedorDTO>("/vendedor/create", dados);
}

export function atualizarVendedor(dados: VendedorDTO): Promise<VendedorDTO> {
  return apiPut<VendedorDTO>("/vendedor/update", dados);
}

export function deletarVendedor(idVendedor: number): Promise<void> {
  return apiDelete(`/vendedor/${idVendedor}`);
}
