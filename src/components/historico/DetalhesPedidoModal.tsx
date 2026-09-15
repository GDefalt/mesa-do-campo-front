"use client";

import Modal from "../ui/Modal";
import styles from "./DetalhesPedidoModal.module.css";
import { usePedidoDetalhado } from "../../hooks/usePedidoDetalhado";
import { formatarPreco } from "../../lib/formatarPreco";
import { imagemDoProduto } from "../../lib/produtoImagem";
import { STATUS_PEDIDO_LABEL, STATUS_PAGAMENTO_LABEL, TIPO_PAGAMENTO_LABEL, StatusPedido } from "@integracao-backend";

interface Props {
  pedidoId: number | null;
  onClose: () => void;
}

const etapas: StatusPedido[] = ["AGUARDANDO_PAGAMENTO", "PROCESSANDO", "ENVIADO", "ENTREGUE"];

export default function DetalhesPedidoModal({ pedidoId, onClose }: Props) {
  const { detalhe, produtos, carregando, erro } = usePedidoDetalhado(pedidoId);

  if (pedidoId == null) return null;

  return (
    <Modal open={pedidoId != null} title={`Pedido #${pedidoId}`} onClose={onClose}>
      {carregando && <p className={styles.texto}>Carregando detalhes...</p>}
      {!carregando && erro && <p className={styles.texto}>{erro}</p>}

      {!carregando && detalhe && (
        <>
          {detalhe.pedido.status === "CANCELADO" ? (
            <p className={styles.canceladoTexto}>Este pedido foi cancelado.</p>
          ) : (
            <div className={styles.rastreio}>
              {etapas.map((etapa, i) => (
                <div
                  key={etapa}
                  className={`${styles.etapa} ${
                    i <= etapas.indexOf(detalhe.pedido.status) ? styles.etapaAtiva : ""
                  }`}
                >
                  <span className={styles.ponto} />
                  <span>{STATUS_PEDIDO_LABEL[etapa]}</span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.secao}>
            <h3>Itens do pedido</h3>
            {detalhe.itens.map((item) => {
              const produto = produtos[item.idProduto];
              return (
                <div className={styles.item} key={item.id}>
                  <img
                    src={produto ? imagemDoProduto(produto.categoria) : "/carrinho.svg"}
                    alt={produto?.nome ?? "Produto"}
                  />
                  <div className={styles.itemInfo}>
                    <span className={styles.itemNome}>{produto?.nome ?? `Produto #${item.idProduto}`}</span>
                    <span className={styles.itemQtd}>
                      {item.quantidade} × {formatarPreco(item.precoUnit)}
                    </span>
                  </div>
                  <span className={styles.itemTotal}>{formatarPreco(item.quantidade * item.precoUnit)}</span>
                </div>
              );
            })}
          </div>

          <div className={styles.secao}>
            <h3>Pagamento</h3>
            {detalhe.pagamento ? (
              <p className={styles.texto}>
                {TIPO_PAGAMENTO_LABEL[detalhe.pagamento.metodoPagamento]} —{" "}
                {STATUS_PAGAMENTO_LABEL[detalhe.pagamento.status]}
              </p>
            ) : (
              <p className={styles.texto}>Nenhum pagamento registrado ainda.</p>
            )}
          </div>

          <div className={styles.resumo}>
            <div className={`${styles.linhaResumo} ${styles.total}`}>
              <span>Total</span>
              <span>{formatarPreco(detalhe.pedido.precoTotal)}</span>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
