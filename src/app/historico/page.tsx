"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import DetalhesPedidoModal from "../../components/historico/DetalhesPedidoModal";
import AvaliarPedidoModal from "../../components/historico/AvaliarPedidoModal";
import Paginacao from "../../components/ui/Paginacao";
import { useClienteAutenticado } from "../../hooks/useClienteAutenticado";
import { formatarPreco } from "../../lib/formatarPreco";
import {
  listarMeusPedidos,
  listarMeusPedidosPaginado,
  confirmarEntregaPedido,
  cancelarPedido,
  Pedido,
  StatusPedido,
  STATUS_PEDIDO_LABEL,
  ApiError,
} from "@integracao-backend";

const TAMANHO_LOTE = 6;

const etapas: StatusPedido[] = ["AGUARDANDO_PAGAMENTO", "PROCESSANDO", "ENVIADO", "ENTREGUE"];

const filtros = ["TODOS", "AGUARDANDO_PAGAMENTO", "PROCESSANDO", "ENVIADO", "ENTREGUE", "CANCELADO"] as const;
type Filtro = (typeof filtros)[number];

function rotuloFiltro(f: Filtro) {
  return f === "TODOS" ? "Todos" : STATUS_PEDIDO_LABEL[f];
}

function StatusBadge({ status }: { status: StatusPedido }) {
  const classe =
    status === "ENTREGUE"
      ? styles.badgeEntregue
      : status === "CANCELADO"
      ? styles.badgeCancelado
      : status === "ENVIADO"
      ? styles.badgeTransito
      : styles.badgePreparando;

  return <span className={`${styles.badge} ${classe}`}>{STATUS_PEDIDO_LABEL[status]}</span>;
}

function Rastreio({ status }: { status: StatusPedido }) {
  if (status === "CANCELADO") {
    return <p className={styles.canceladoTexto}>Este pedido foi cancelado.</p>;
  }

  const indiceAtual = etapas.indexOf(status);

  return (
    <div className={styles.rastreio}>
      {etapas.map((etapa, i) => (
        <div
          key={etapa}
          className={`${styles.rastreioEtapa} ${i <= indiceAtual ? styles.rastreioAtiva : ""}`}
        >
          <span className={styles.rastreioPonto} />
          <span className={styles.rastreioLabel}>{STATUS_PEDIDO_LABEL[etapa]}</span>
        </div>
      ))}
    </div>
  );
}

export default function Historico() {
  const { cliente } = useClienteAutenticado();

  const [filtro, setFiltro] = useState<Filtro>("TODOS");
  const semFiltro = filtro === "TODOS";

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [lote, setLote] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [acaoEmCurso, setAcaoEmCurso] = useState<number | null>(null);

  const [pedidoDetalheId, setPedidoDetalheId] = useState<number | null>(null);
  const [pedidoAvaliarId, setPedidoAvaliarId] = useState<number | null>(null);

  useEffect(() => {
    setLote(1);
  }, [filtro]);

  function carregarPedidos() {
    setCarregando(true);
    setErro("");

    const busca = semFiltro
      ? listarMeusPedidosPaginado({ lote, limite: TAMANHO_LOTE })
      : listarMeusPedidos().then((lista) => ({
          itens: lista.filter((p) => p.status === filtro),
          totalItens: lista.filter((p) => p.status === filtro).length,
          totalPaginas: 1,
          paginaAtual: 1,
          tamanhoPagina: lista.length,
        }));

    busca
      .then((resultado) => {
        setPedidos(resultado.itens.sort((a, b) => b.id - a.id));
        setTotalItens(resultado.totalItens);
        setTotalPaginas(resultado.totalPaginas);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setPedidos([]);
          setTotalItens(0);
          setTotalPaginas(1);
        } else {
          setErro(err instanceof ApiError ? err.message : "Não foi possível carregar seus pedidos.");
        }
      })
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregarPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro, lote]);

  async function handleConfirmarEntrega(id: number) {
    setAcaoEmCurso(id);
    try {
      await confirmarEntregaPedido(id);
      carregarPedidos();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Não foi possível confirmar a entrega.");
    } finally {
      setAcaoEmCurso(null);
    }
  }

  async function handleCancelar(id: number) {
    if (!window.confirm("Tem certeza que deseja cancelar este pedido?")) return;

    setAcaoEmCurso(id);
    try {
      await cancelarPedido(id);
      carregarPedidos();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Não foi possível cancelar o pedido.");
    } finally {
      setAcaoEmCurso(null);
    }
  }

  return (
    <div className={styles.body}>
      <div className={styles.topo}>
        <h1>Meus Pedidos</h1>
        <p className={styles.subtitulo}>Acompanhe suas compras e o histórico de entregas.</p>
        <div className={styles.linha}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.tabs}>
          {filtros.map((f) => (
            <button
              key={f}
              className={`${styles.tab} ${filtro === f ? styles.tabAtiva : ""}`}
              onClick={() => setFiltro(f)}
            >
              {rotuloFiltro(f)}
            </button>
          ))}
        </div>

        {carregando && <p className={styles.subtitulo}>Carregando pedidos...</p>}
        {!carregando && erro && <p className={styles.subtitulo}>{erro}</p>}

        {!carregando && !erro && pedidos.length === 0 && (
          <div className={styles.vazio}>
            <img src="/carrinho.svg" alt="" className={styles.vazioIcon} />
            <p>Nenhum pedido encontrado nesta categoria.</p>
          </div>
        )}

        <div className={styles.lista}>
          {pedidos.map((pedido) => (
            <div className={styles.pedido} key={pedido.id}>
              <div className={styles.pedidoHeader}>
                <div>
                  <h3>Pedido #{pedido.id}</h3>
                  <span className={styles.data}>
                    {new Date(pedido.dataCompra).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <StatusBadge status={pedido.status} />
              </div>

              <Rastreio status={pedido.status} />

              <div className={styles.pedidoFooter}>
                <span className={styles.total}>Total: {formatarPreco(pedido.precoTotal)}</span>
                <div className={styles.acoes}>
                  <button className={styles.btnSecundario} onClick={() => setPedidoDetalheId(pedido.id)}>
                    Ver detalhes
                  </button>

                  {(pedido.status === "AGUARDANDO_PAGAMENTO" || pedido.status === "PROCESSANDO") && (
                    <button
                      className={styles.btnPerigo}
                      disabled={acaoEmCurso === pedido.id}
                      onClick={() => handleCancelar(pedido.id)}
                    >
                      {acaoEmCurso === pedido.id ? "Cancelando..." : "Cancelar pedido"}
                    </button>
                  )}

                  {pedido.status === "ENVIADO" && (
                    <button
                      className={styles.btnPrimario}
                      disabled={acaoEmCurso === pedido.id}
                      onClick={() => handleConfirmarEntrega(pedido.id)}
                    >
                      {acaoEmCurso === pedido.id ? "Confirmando..." : "Confirmar entrega"}
                    </button>
                  )}

                  {pedido.status === "ENTREGUE" && (
                    <button className={styles.btnPrimario} onClick={() => setPedidoAvaliarId(pedido.id)}>
                      Avaliar Produto
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {semFiltro && !carregando && !erro && (
          <Paginacao
            paginaAtual={lote}
            totalPaginas={totalPaginas}
            totalItens={totalItens}
            onMudarPagina={setLote}
          />
        )}
      </div>

      <DetalhesPedidoModal pedidoId={pedidoDetalheId} onClose={() => setPedidoDetalheId(null)} />

      <AvaliarPedidoModal
        pedidoId={pedidoAvaliarId}
        idClienteAutenticado={cliente?.id ?? null}
        onClose={() => setPedidoAvaliarId(null)}
      />
    </div>
  );
}
