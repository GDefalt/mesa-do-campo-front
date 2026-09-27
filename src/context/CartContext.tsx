"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { lerStorage, salvarStorage } from "../lib/storage";

export interface CartItem {
  id: number;
  nome: string;
  imagem: string;
  precoUnitario: number;
  quantidade: number;
}

interface CartContextValue {
  itens: CartItem[];
  adicionarItem: (item: Omit<CartItem, "quantidade">, quantidade?: number) => void;
  removerItem: (id: number) => void;
  atualizarQuantidade: (id: number, quantidade: number) => void;
  limparCarrinho: () => void;
  subtotal: number;
  frete: number;
  total: number;
  quantidadeTotal: number;
}

const CHAVE_CARRINHO = "mesa-do-campo:carrinho";
// O back-end não tem campo de frete no Pedido — o checkout cobra exatamente
// a soma dos itens. Mantemos a linha de "Entrega" na tela por clareza, mas
// sempre como Grátis, para não mostrar um valor que nunca é cobrado de verdade.
const FRETE_PADRAO = 0;

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<CartItem[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    setItens(lerStorage<CartItem[]>(CHAVE_CARRINHO, []));
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (carregado) salvarStorage(CHAVE_CARRINHO, itens);
  }, [itens, carregado]);

  function adicionarItem(item: Omit<CartItem, "quantidade">, quantidade = 1) {
    setItens((atual) => {
      const existente = atual.find((i) => i.id === item.id);
      if (existente) {
        return atual.map((i) =>
          i.id === item.id ? { ...i, quantidade: i.quantidade + quantidade } : i
        );
      }
      return [...atual, { ...item, quantidade }];
    });
  }

  function removerItem(id: number) {
    setItens((atual) => atual.filter((i) => i.id !== id));
  }

  function atualizarQuantidade(id: number, quantidade: number) {
    if (quantidade < 1) return;
    setItens((atual) => atual.map((i) => (i.id === id ? { ...i, quantidade } : i)));
  }

  function limparCarrinho() {
    setItens([]);
  }

  const subtotal = itens.reduce((soma, i) => soma + i.precoUnitario * i.quantidade, 0);
  const frete = itens.length > 0 ? FRETE_PADRAO : 0;
  const total = subtotal + frete;
  const quantidadeTotal = itens.reduce((soma, i) => soma + i.quantidade, 0);

  return (
    <CartContext.Provider
      value={{
        itens,
        adicionarItem,
        removerItem,
        atualizarQuantidade,
        limparCarrinho,
        subtotal,
        frete,
        total,
        quantidadeTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const contexto = useContext(CartContext);
  if (!contexto) {
    throw new Error("useCart precisa ser usado dentro de um CartProvider");
  }
  return contexto;
}
