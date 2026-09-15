"use client";

import { useEffect, useState } from "react";
import { listarItensVendidos, getProdutoPorId, ItemPedido, Produto, ApiError } from "@integracao-backend";

interface UseItensVendidosResult {
  itens: ItemPedido[];
  produtos: Record<number, Produto>;
  carregando: boolean;
  erro: string;
}

export function useItensVendidos(idVendedor: number): UseItensVendidosResult {
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [produtos, setProdutos] = useState<Record<number, Produto>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;
    setCarregando(true);
    setErro("");

    listarItensVendidos(idVendedor)
      .then(async (lista) => {
        if (cancelado) return;
        setItens(lista);

        const idsUnicos = Array.from(new Set(lista.map((i) => i.idProduto)));
        const encontrados = await Promise.all(
          idsUnicos.map((id) => getProdutoPorId(id).catch(() => null))
        );

        if (cancelado) return;

        const mapa: Record<number, Produto> = {};
        encontrados.forEach((p) => {
          if (p) mapa[p.id] = p;
        });
        setProdutos(mapa);
      })
      .catch((err) => {
        if (cancelado) return;
        if (err instanceof ApiError && err.status === 404) {
          setItens([]);
        } else {
          setErro(err instanceof ApiError ? err.message : "Não foi possível carregar os itens vendidos.");
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idVendedor]);

  return { itens, produtos, carregando, erro };
}
