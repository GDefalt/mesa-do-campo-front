import { getAuthHeader, limparCredenciais } from "./authStorage";

/**
 * Toda resposta do back-end é embrulhada pelo ModelResponseAdivice em um
 * ReturnModel (Entities/External/ReturnModel.java):
 * { status, path, success, quantity, batch, itens: [...], errors }
 * — mesmo endpoints que retornam um único objeto vêm dentro de "itens".
 *
 * Paginação: o back-end agora corta listas em lotes controlados pelos
 * HEADERS "limit" (itens por lote, padrão 10) e "batch" (número do lote,
 * começando em 1). A resposta inclui "quantity" (total de itens, em TODOS
 * os lotes) e "batch": { quantity: limite usado, loteAtual, loteTotal }.
 */
interface BatchModel {
  quantity: number;
  loteAtual: number;
  loteTotal: number;
}

interface ReturnModel<T> {
  status: number;
  path: string;
  success: boolean;
  quantity: number | null;
  batch: BatchModel | null;
  itens: T[] | null;
  errors: { status: number; message: string; hour: string } | null;
}

export interface PaginaResultado<T> {
  itens: T[];
  totalItens: number;
  paginaAtual: number;
  totalPaginas: number;
  tamanhoPagina: number;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Requisição não exige autenticação (ex: login, cadastro, catálogo público) */
  autenticado?: boolean;
  /** Paginação: nº de itens por lote e qual lote buscar (1-indexado). */
  limite?: number;
  lote?: number;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ReturnModel<T>> {
  const { method = "GET", body, autenticado = true, limite, lote } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (autenticado) {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      throw new ApiError(401, "Você precisa estar logado para realizar essa ação.");
    }
    headers["Authorization"] = authHeader;
  }

  if (limite != null) headers["limit"] = String(limite);
  if (lote != null) headers["batch"] = String(lote);

  const url = path.startsWith("/api") ? path : `/api${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Não foi possível conectar ao servidor. Verifique se o back-end está rodando.");
  }

  let parsed: ReturnModel<T> | null = null;
  try {
    parsed = await response.json();
  } catch {
    // resposta sem corpo
  }

  if (!response.ok || !parsed || parsed.success === false) {
    // Se o back-end recusou nossas credenciais (senha alterada, sessão velha
    // guardada no navegador, back-end reiniciado etc.), não faz sentido
    // deixar a pessoa presa vendo esse erro em toda tela autenticada — já
    // limpamos a credencial inválida e mandamos ela logar de novo.
    if (response.status === 401 && autenticado) {
      limparCredenciais();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    const mensagem =
      parsed?.errors?.message ||
      (response.status === 401
        ? "Sua sessão expirou. Faça login novamente."
        : `Erro ${response.status} ao comunicar com o servidor.`);
    throw new ApiError(response.status, mensagem);
  }

  return parsed;
}

/**
 * GET paginado: usa os headers limit/batch e devolve os itens do lote junto
 * com a informação de paginação, para telas com "Anterior/Próximo".
 */
export async function apiGetPagina<T>(
  path: string,
  { lote = 1, limite = 10, autenticado = true }: { lote?: number; limite?: number; autenticado?: boolean } = {}
): Promise<PaginaResultado<T>> {
  const resultado = await request<T>(path, { method: "GET", autenticado, lote, limite });

  return {
    itens: resultado.itens ?? [],
    totalItens: resultado.quantity ?? resultado.itens?.length ?? 0,
    paginaAtual: resultado.batch?.loteAtual ?? lote,
    totalPaginas: resultado.batch?.loteTotal ?? 1,
    tamanhoPagina: resultado.batch?.quantity ?? limite,
  };
}

/**
 * GET que retorna uma lista inteira (não paginada na tela). Como o back-end
 * agora corta listas em lotes de 10 por padrão, pedimos um limite bem alto
 * para continuar recebendo tudo de uma vez nos lugares que ainda não têm
 * controles de paginação na UI.
 */
export async function apiGetList<T>(path: string, autenticado = true): Promise<T[]> {
  const resultado = await request<T>(path, { method: "GET", autenticado, limite: 1000, lote: 1 });
  return resultado.itens ?? [];
}

/** GET que retorna um único objeto (primeiro item do ReturnModel) */
export async function apiGetOne<T>(path: string, autenticado = true): Promise<T> {
  const resultado = await request<T>(path, { method: "GET", autenticado });
  if (!resultado.itens || resultado.itens.length === 0) {
    throw new ApiError(404, "Registro não encontrado.");
  }
  return resultado.itens[0];
}

export async function apiPost<T>(path: string, body: unknown, autenticado = true): Promise<T> {
  const resultado = await request<T>(path, { method: "POST", body, autenticado });
  return resultado.itens![0];
}

export async function apiPut<T>(path: string, body: unknown, autenticado = true): Promise<T> {
  const resultado = await request<T>(path, { method: "PUT", body, autenticado });
  return resultado.itens![0];
}

export async function apiPatch<T>(path: string, body?: unknown, autenticado = true): Promise<T> {
  const resultado = await request<T>(path, { method: "PATCH", body, autenticado });
  return resultado.itens![0];
}

export async function apiDelete(path: string, autenticado = true): Promise<void> {
  await request<never>(path, { method: "DELETE", autenticado });
}

