"use client";

import { useEffect, useState } from "react";
import { listarTodosProdutos, Produto, ApiError } from "@integracao-backend";

interface UseTodosProdutosResult {
  produtos: Produto[];
  carregando: boolean;
  erro: string;
}

/** GET /api/produto/all — catálogo é público, não exige login. */
export function useTodosProdutos(): UseTodosProdutosResult {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;

    listarTodosProdutos()
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
  }, []);

  return { produtos, carregando, erro };
}
