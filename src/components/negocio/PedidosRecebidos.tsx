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
const STATUS_EDITAVEIS: StatusItemPedido[] = ["PENDENTE", "PREPARANDO", "EM_TRANSITO"];

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

export default function ProdutosVendidos({ idVendedor }: Props) {
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [produtos, setProdutos] = useState<Record<number, Produto>>({});
  const [meusProdutos, setMeusProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [produtoFiltro, setProdutoFiltro] = useState("todos");
  const [statusFiltro, setStatusFiltro] = useState<StatusItemPedido | "TODOS">("TODOS");
  const [atualizandoId, setAtualizandoId] = useState<number | null>(null);

  const [lote, setLote] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const semFiltro = produtoFiltro === "todos" && statusFiltro === "TODOS";

  // Lista de produtos do vendedor, usada só para preencher o filtro (não
  // depende do lote atual de itens vendidos).
  useEffect(() => {
    listarProdutosPorVendedor(idVendedor)
      .then(setMeusProdutos)
      .catch(() => setMeusProdutos([]));
  }, [idVendedor]);

  useEffect(() => {
    setLote(1);
  }, [produtoFiltro, statusFiltro]);

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
          const filtrados = lista
            .filter((item) => produtoFiltro === "todos" || item.idProduto === Number(produtoFiltro))
            .filter((item) => statusFiltro === "TODOS" || item.status === statusFiltro)
            .sort((a, b) => (b.dataCompra ?? "").localeCompare(a.dataCompra ?? ""));
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
          setErro(err instanceof ApiError ? err.message : "Não foi possível carregar os produtos vendidos.");
        }
      })
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    if (semFiltro || meusProdutos.length > 0) {
      carregar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idVendedor, lote, produtoFiltro, statusFiltro, meusProdutos]);

  async function atualizarStatus(item: ItemPedido, novoStatus: StatusItemPedido) {
    if (!STATUS_EDITAVEIS.includes(novoStatus) || item.status === novoStatus) return;

    setAtualizandoId(item.id);
    try {
      await atualizarStatusItem(item.id, novoStatus);
      setItens((atuais) => atuais.map((atual) => (
        atual.id === item.id ? { ...atual, status: novoStatus } : atual
      )));
      carregar();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Não foi possível atualizar o status.");
    } finally {
      setAtualizandoId(null);
    }
  }

  function formatarDataCompra(dataCompra?: string) {
    if (!dataCompra) return "Não informada";
    const data = new Date(dataCompra);
    return Number.isNaN(data.getTime())
      ? "Não informada"
      : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(data);
  }

  return (
    <div>
      <h2 className={styles.titulo}>Produtos vendidos</h2>
      <p className={styles.subtitulo}>Histórico dos seus itens vendidos e acompanhamento do preparo para o comprador.</p>

      <div className={styles.filtros}>
        <label className={styles.selectFiltro}>
          Produto
          <select value={produtoFiltro} onChange={(e) => setProdutoFiltro(e.target.value)}>
            <option value="todos">Todos os produtos</option>
            {meusProdutos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.selectFiltro}>
          Status
          <select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value as StatusItemPedido | "TODOS")}>
            <option value="TODOS">Todos os status</option>
            {Object.entries(STATUS_ITEM_PEDIDO_LABEL).map(([status, label]) => (
              <option key={status} value={status}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {carregando ? (
        <p className={styles.vazio}>Carregando produtos vendidos...</p>
      ) : erro ? (
        <p className={styles.vazio}>{erro}</p>
      ) : (
        <div className={styles.tabela}>
          <div className={styles.linhaCabecalho}>
            <span>Pedido</span>
            <span>Produto</span>
            <span>Data da compra</span>
            <span>Valor</span>
            <span>Status</span>
            <span>Atualizar status</span>
          </div>

          {itens.map((item) => (
            <div className={styles.linha} key={item.id}>
              <span className={styles.pedidoId}>Pedido #{item.idPedido}</span>
              <span>
                {produtos[item.idProduto]?.nome ?? `Produto #${item.idProduto}`} × {item.quantidade}
              </span>
              <span className={styles.pedidoData}>{formatarDataCompra(item.dataCompra)}</span>
              <span>{formatarPreco(item.precoUnit * item.quantidade)}</span>
              <span className={`${styles.badge} ${styles[statusClasse[item.status]]}`}>
                {STATUS_ITEM_PEDIDO_LABEL[item.status]}
              </span>
              <span>
                {STATUS_EDITAVEIS.includes(item.status) ? (
                  <select
                    className={styles.selectStatus}
                    disabled={atualizandoId === item.id}
                    value={item.status}
                    onChange={(e) => atualizarStatus(item, e.target.value as StatusItemPedido)}
                  >
                    {STATUS_EDITAVEIS.map((status) => (
                      <option key={status} value={status}>{STATUS_ITEM_PEDIDO_LABEL[status]}</option>
                    ))}
                  </select>
                ) : (
                  <span className={styles.statusBloqueado}>Finalizado</span>
                )}
              </span>
            </div>
          ))}

          {itens.length === 0 && <p className={styles.vazio}>Nenhum produto vendido encontrado para esse filtro.</p>}
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
