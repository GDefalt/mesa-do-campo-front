"use client";

import { useEffect, useState } from "react";
import { getPedidoDetalhado, getProdutoPorId, PedidoDetalhado, Produto, ApiError } from "@integracao-backend";

interface UsePedidoDetalhadoResult {
  detalhe: PedidoDetalhado | null;
  produtos: Record<number, Produto>;
  carregando: boolean;
  erro: string;
}

/**
 * GET /api/pedidos/detalhe/{id} só devolve idProduto em cada item (não o
 * nome/imagem) — então buscamos cada Produto envolvido separadamente para
 * poder mostrar nome, categoria e o idVendedor (usado na hora de avaliar).
 */
export function usePedidoDetalhado(pedidoId: number | null): UsePedidoDetalhadoResult {
  const [detalhe, setDetalhe] = useState<PedidoDetalhado | null>(null);
  const [produtos, setProdutos] = useState<Record<number, Produto>>({});
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (pedidoId == null) {
      setDetalhe(null);
      setProdutos({});
      setErro("");
      return;
    }

    let cancelado = false;
    setCarregando(true);
    setErro("");

    getPedidoDetalhado(pedidoId)
      .then(async (dados) => {
        if (cancelado) return;
        setDetalhe(dados);

        const idsUnicos = Array.from(new Set(dados.itens.map((item) => item.idProduto)));
        const encontrados = await Promise.all(
          idsUnicos.map((idProduto) => getProdutoPorId(idProduto).catch(() => null))
        );

        if (cancelado) return;

        const mapa: Record<number, Produto> = {};
        encontrados.forEach((produto) => {
          if (produto) mapa[produto.id] = produto;
        });
        setProdutos(mapa);
      })
      .catch((err) => {
        if (!cancelado) {
          setErro(err instanceof ApiError ? err.message : "Não foi possível carregar os detalhes do pedido.");
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [pedidoId]);

  return { detalhe, produtos, carregando, erro };
}
