import { apiGetOne, apiGetList, apiPost, apiPut, apiDelete } from "./client";
import { Endereco } from "./types";

export function getEnderecoPorId(id: number): Promise<Endereco> {
  return apiGetOne<Endereco>(`/endereco/unique/${id}`);
}

/** GET /api/endereco/user — sempre retorna os endereços do usuário autenticado */
export function listarMeusEnderecos(): Promise<Endereco[]> {
  return apiGetList<Endereco>("/endereco/user");
}

export function criarEndereco(dados: Omit<Endereco, "id">): Promise<Endereco> {
  return apiPost<Endereco>("/endereco/create", dados);
}

export function atualizarEndereco(dados: Endereco): Promise<Endereco> {
  return apiPut<Endereco>("/endereco/update", dados);
}

export function deletarEndereco(id: number): Promise<void> {
  return apiDelete(`/endereco/${id}`);
}

/**
 * Consulta pública de CEP (BrasilAPI), exatamente como indicado no comentário
 * da entidade Endereco.java no back-end: estado, cidade e rua vêm de lá, e
 * apenas o número/complemento são preenchidos pelo usuário.
 */
export interface CepResultado {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
}

export async function buscarCep(cep: string): Promise<CepResultado | null> {
  const cepLimpo = cep.replace(/\D/g, "");
  if (cepLimpo.length !== 8) return null;

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cepLimpo}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}
