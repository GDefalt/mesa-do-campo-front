// Utilitário simples para persistir dados no navegador (usado pelo carrinho,
// que ainda não tem equivalente no back-end).

export function lerStorage<T>(chave: string, valorPadrao: T): T {
  if (typeof window === "undefined") return valorPadrao;

  try {
    const bruto = window.localStorage.getItem(chave);
    if (!bruto) return valorPadrao;
    return JSON.parse(bruto) as T;
  } catch {
    return valorPadrao;
  }
}

export function salvarStorage<T>(chave: string, valor: T): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Armazenamento indisponível (modo privado, cota excedida etc.)
  }
}

export const CHAVES = {
  carrinho: "mesa-do-campo:carrinho",
} as const;
