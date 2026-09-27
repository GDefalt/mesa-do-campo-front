/**
 * O Interceptador do back-end (Config/Interceptador.java) autentica cada
 * requisição via HTTP Basic Auth usando "nome:senha" — não usa token/JWT, e
 * usa o NOME do cliente (não o e-mail, apesar do login ser feito por e-mail).
 * Por isso precisamos guardar nome + senha em texto puro no navegador para
 * remontar o header Authorization em cada chamada autenticada.
 *
 * Isso é uma limitação do back-end nesta branch (dev), não uma escolha do
 * front — o ideal, futuramente, seria o back-end emitir um token de sessão.
 *
 * Este arquivo é propositalmente autocontido (sem importar nada de `src/`),
 * já que toda a pasta `integracao-backend/` deve poder ser reaproveitada de
 * forma independente do restante da aplicação.
 */

export interface Credenciais {
  nome: string;
  senha: string;
}

const CHAVE_CREDENCIAIS = "mesa-do-campo:credenciais";

function lerStorage<T>(chave: string, valorPadrao: T): T {
  if (typeof window === "undefined") return valorPadrao;

  try {
    const bruto = window.localStorage.getItem(chave);
    if (!bruto) return valorPadrao;
    return JSON.parse(bruto) as T;
  } catch {
    return valorPadrao;
  }
}

function salvarStorage<T>(chave: string, valor: T): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Armazenamento indisponível (modo privado, cota excedida etc.)
  }
}

export function salvarCredenciais(credenciais: Credenciais): void {
  salvarStorage(CHAVE_CREDENCIAIS, credenciais);
}

export function lerCredenciais(): Credenciais | null {
  return lerStorage<Credenciais | null>(CHAVE_CREDENCIAIS, null);
}

export function limparCredenciais(): void {
  salvarStorage<Credenciais | null>(CHAVE_CREDENCIAIS, null);
}

export function estaAutenticado(): boolean {
  return lerCredenciais() !== null;
}

/** Codifica em Base64 preservando corretamente acentos (UTF-8), como o back-end espera. */
function paraBase64Utf8(texto: string): string {
  const bytes = new TextEncoder().encode(texto);
  let binario = "";
  bytes.forEach((byte) => {
    binario += String.fromCharCode(byte);
  });
  return btoa(binario);
}

export function getAuthHeader(): string | null {
  const credenciais = lerCredenciais();
  if (!credenciais) return null;

  const token = paraBase64Utf8(`${credenciais.nome}:${credenciais.senha}`);
  return `Basic ${token}`;
}
