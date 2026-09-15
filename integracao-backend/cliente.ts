import { apiGetOne, apiPost, apiPut, apiPatch, apiGetList, apiDelete } from "./client";
import { ClienteDTO, ClienteCreate, LoginPayload } from "./types";

/** POST /api/cliente/create — cadastro de um novo cliente (não exige autenticação) */
export function cadastrarCliente(dados: ClienteCreate): Promise<ClienteDTO> {
  return apiPost<ClienteDTO>("/cliente/create", dados, false);
}

/** POST /api/cliente/login — login por e-mail e senha (não exige autenticação) */
export function loginCliente(dados: LoginPayload): Promise<ClienteDTO> {
  return apiPost<ClienteDTO>("/cliente/login", dados, false);
}

/** GET /api/cliente/auto — dados do cliente autenticado */
export function getClienteAutenticado(): Promise<ClienteDTO> {
  return apiGetOne<ClienteDTO>("/cliente/auto");
}

/** GET /api/cliente/{id} */
export function getClientePorId(id: number): Promise<ClienteDTO> {
  return apiGetOne<ClienteDTO>(`/cliente/${id}`, false);
}

/** GET /api/cliente/all */
export function listarClientes(): Promise<ClienteDTO[]> {
  return apiGetList<ClienteDTO>("/cliente/all", false);
}

/** PUT /api/cliente/update — CPF/CNPJ e e-mail são imutáveis no back-end */
export function atualizarCliente(dados: ClienteDTO): Promise<ClienteDTO> {
  return apiPut<ClienteDTO>("/cliente/update", dados);
}

/** PATCH /api/cliente/change/senha */
export function atualizarSenhaCliente(senha: string): Promise<ClienteDTO> {
  return apiPatch<ClienteDTO>("/cliente/change/senha", { senha });
}

/** PATCH /api/cliente/change/endereco/{idEndereco} */
export function atualizarEnderecoEntrega(idEndereco: number): Promise<ClienteDTO> {
  return apiPatch<ClienteDTO>(`/cliente/change/endereco/${idEndereco}`);
}

/** DELETE /api/cliente/{idAlvo} — só é permitido deletar a própria conta */
export function deletarCliente(idAlvo: number): Promise<void> {
  return apiDelete(`/cliente/${idAlvo}`);
}
