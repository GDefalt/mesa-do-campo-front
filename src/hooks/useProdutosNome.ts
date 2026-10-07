"use client";

import { useEffect, useState } from "react";
import { listarProdutosNome, Produto, ApiError } from "@integracao-backend";

interface UseProdutosResult {
  produtos: Produto[];
  carregando: boolean;
  erro: string;
}

/** GET /api/produto/name/{nome} — catálogo é público, não exige login. */
export function useProdutosNome(nome: string): UseProdutosResult {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;

    if (!nome.trim()) {
      setProdutos([]);
      setErro("");
      setCarregando(false);
      return;
    }

    setCarregando(true);
    setErro("");

    listarProdutosNome(nome)
      .then((lista) => {
        if (!cancelado) setProdutos(lista);
      })
      .catch((err) => {
        if (cancelado) return;
        // 404 "Registro não encontrado" do back-end quando não há produtos ainda
        if (err instanceof ApiError && err.status === 404) {
          setProdutos([]);
        } else {
          setErro(err instanceof ApiError ? err.message : "Não foi possível carregar os produtos.");
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [nome]);

  return { produtos, carregando, erro };
}
