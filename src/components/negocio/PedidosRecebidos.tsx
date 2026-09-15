"use client";

import { useEffect, useState } from "react";
import styles from "./PedidosRecebidos.module.css";
import Paginacao from "../ui/Paginacao";
import { formatarPreco } from "../../lib/formatarPreco";
import {
  listarItensVendidos,
  listarItensVendidosPaginado,
  listarProdutosPorVendedor,
  atualizarStatusItem,
  getProdutoPorId,
  ItemPedido,
  Produto,
  StatusItemPedido,
  STATUS_ITEM_PEDIDO_LABEL,
  ApiError,
} from "@integracao-backend";

const TAMANHO_LOTE = 8;

interface Props {
  idVendedor: number;
}

const statusClasse: Record<StatusItemPedido, string> = {
  PENDENTE: "badgePreparando",
  PREPARANDO: "badgePreparando",
  EM_TRANSITO: "badgeTransito",
  ENTREGUE: "badgeEntregue",
  CANCELADO: "badgeCancelado",
};

// Próximo passo natural no fluxo de preparo/envio de cada item.
const proximoStatus: Partial<Record<StatusItemPedido, StatusItemPedido>> = {
  PENDENTE: "PREPARANDO",
  PREPARANDO: "EM_TRANSITO",
  EM_TRANSITO: "ENTREGUE",
};

export default function PedidosRecebidos({ idVendedor }: Props) {
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [produtos, setProdutos] = useState<Record<number, Produto>>({});
  const [meusProdutos, setMeusProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [produtoFiltro, setProdutoFiltro] = useState("Todos os produtos");
  const [atualizandoId, setAtualizandoId] = useState<number | null>(null);

  const [lote, setLote] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const semFiltro = produtoFiltro === "Todos os produtos";

  // Lista de produtos do vendedor, usada só para preencher o filtro (não
  // depende do lote atual de itens vendidos).
  useEffect(() => {
    listarProdutosPorVendedor(idVendedor)
      .then(setMeusProdutos)
      .catch(() => setMeusProdutos([]));
  }, [idVendedor]);

  useEffect(() => {
    setLote(1);
  }, [produtoFiltro]);

  async function preencherProdutos(lista: ItemPedido[]) {
    const idsUnicos = Array.from(new Set(lista.map((i) => i.idProduto)));
    const encontrados = await Promise.all(idsUnicos.map((id) => getProdutoPorId(id).catch(() => null)));

    const mapa: Record<number, Produto> = {};
    encontrados.forEach((p) => {
      if (p) mapa[p.id] = p;
    });
    setProdutos((atual) => ({ ...atual, ...mapa }));
  }

  function carregar() {
    setCarregando(true);
    setErro("");

    const busca = semFiltro
      ? listarItensVendidosPaginado(idVendedor, { lote, limite: TAMANHO_LOTE })
      : listarItensVendidos(idVendedor).then((lista) => {
          const idProdutoFiltro = meusProdutos.find((p) => p.nome === produtoFiltro)?.id;
          const filtrados = lista.filter((item) => item.idProduto === idProdutoFiltro);
          return {
            itens: filtrados,
            totalItens: filtrados.length,
            totalPaginas: 1,
            paginaAtual: 1,
            tamanhoPagina: filtrados.length,
          };
        });

    busca
      .then(async (resultado) => {
        setItens(resultado.itens);
        setTotalItens(resultado.totalItens);
        setTotalPaginas(resultado.totalPaginas);
        await preencherProdutos(resultado.itens);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setItens([]);
          setTotalItens(0);
          setTotalPaginas(1);
        } else {
          setErro(err instanceof ApiError ? err.message : "Não foi possível carregar os pedidos recebidos.");
        }
      })
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    if (semFiltro || meusProdutos.length > 0) {
      carregar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idVendedor, lote, produtoFiltro, meusProdutos]);

  async function avancarStatus(item: ItemPedido) {
    const novoStatus = proximoStatus[item.status];
    if (!novoStatus) return;

    setAtualizandoId(item.id);
    try {
      await atualizarStatusItem(item.id, novoStatus);
      carregar();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Não foi possível atualizar o status.");
    } finally {
      setAtualizandoId(null);
    }
  }

  return (
    <div>
      <h2 className={styles.titulo}>Pedidos recebidos</h2>
      <p className={styles.subtitulo}>Itens dos seus produtos vendidos em pedidos de clientes.</p>

      <div className={styles.filtros}>
        <label className={styles.selectFiltro}>
          Meus produtos
          <select value={produtoFiltro} onChange={(e) => setProdutoFiltro(e.target.value)}>
            <option>Todos os produtos</option>
            {meusProdutos.map((p) => (
              <option key={p.id} value={p.nome}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      {carregando ? (
        <p className={styles.vazio}>Carregando pedidos recebidos...</p>
      ) : erro ? (
        <p className={styles.vazio}>{erro}</p>
      ) : (
        <div className={styles.tabela}>
          <div className={styles.linhaCabecalho}>
            <span>Pedido</span>
            <span>Produto</span>
            <span>Valor</span>
            <span>Status</span>
            <span></span>
          </div>

          {itens.map((item) => (
            <div className={styles.linha} key={item.id}>
              <span className={styles.pedidoId}>Pedido #{item.idPedido}</span>
              <span>
                {produtos[item.idProduto]?.nome ?? `Produto #${item.idProduto}`} × {item.quantidade}
              </span>
              <span>{formatarPreco(item.precoUnit * item.quantidade)}</span>
              <span className={`${styles.badge} ${styles[statusClasse[item.status]]}`}>
                {STATUS_ITEM_PEDIDO_LABEL[item.status]}
              </span>
              <span>
                {proximoStatus[item.status] && (
                  <button
                    className={styles.btnAvancar}
                    disabled={atualizandoId === item.id}
                    onClick={() => avancarStatus(item)}
                  >
                    {atualizandoId === item.id
                      ? "Atualizando..."
                      : `Marcar como ${STATUS_ITEM_PEDIDO_LABEL[proximoStatus[item.status]!]}`}
                  </button>
                )}
              </span>
            </div>
          ))}

          {itens.length === 0 && <p className={styles.vazio}>Nenhum pedido encontrado para esse filtro.</p>}
        </div>
      )}

      {semFiltro && !carregando && !erro && (
        <Paginacao
          paginaAtual={lote}
          totalPaginas={totalPaginas}
          totalItens={totalItens}
          onMudarPagina={setLote}
        />
      )}
    </div>
  );
}
