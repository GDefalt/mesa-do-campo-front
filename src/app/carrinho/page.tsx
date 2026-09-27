"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../carrinho/page.module.css";
import PaymentModal from "../../components/carrinho/PaymentModal";
import { useCart } from "../../context/CartContext";
import { formatarPreco } from "../../lib/formatarPreco";
import { checkout, TipoPagamento } from "@integracao-backend";

export default function Carrinho() {
  const { itens, atualizarQuantidade, removerItem, subtotal, frete, total, limparCarrinho } = useCart();
  const [pagamentoAberto, setPagamentoAberto] = useState(false);

  function handleQuantidadeChange(id: number, valor: string) {
    const quantidade = parseInt(valor, 10);
    if (!isNaN(quantidade) && quantidade >= 1) {
      atualizarQuantidade(id, quantidade);
    }
  }

  async function handleConfirmarPagamento(metodo: TipoPagamento) {
    const resultado = await checkout({
      itens: itens.map((item) => ({ idProduto: item.id, quantidade: item.quantidade })),
      metodoPagamento: metodo,
    });

    limparCarrinho();

    return { numeroPedido: `#${resultado.pedido.id}` };
  }

  if (itens.length === 0) {
    return (
      <div className={styles.carrinho_body}>
        <div className={styles.topo}>
          <h1>Seu Carrinho</h1>
          <div className={styles.linha}></div>
        </div>

        <div className={styles.vazio}>
          <img src="/carrinho.svg" alt="" className={styles.vazioIcon} />
          <p>Seu carrinho está vazio.</p>
          <Link href="/catalogo" className={styles.btnVoltar}>
            Ver produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.carrinho_body}>
      <div className={styles.topo}>
        <h1>Seu Carrinho</h1>
        <div className={styles.linha}></div>
      </div>

      <div className={styles.container}>

        <div className={styles["lista-produtos"]}>

          {itens.map((item) => (
            <div className={styles.produto} key={item.id}>

              <img src={item.imagem} alt={item.nome} />

              <div className={styles.info}>
                <h3>{item.nome}</h3>
                <p>{formatarPreco(item.precoUnitario)} / unidade</p>
              </div>

              <div className={styles.quantidade}>
                <button
                  className={styles.btnQtdMini}
                  onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                  disabled={item.quantidade <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.quantidade}
                  min={1}
                  onChange={(e) => handleQuantidadeChange(item.id, e.target.value)}
                />
                <button
                  className={styles.btnQtdMini}
                  onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                >
                  +
                </button>
              </div>

              <div className={styles.preco}>
                {formatarPreco(item.precoUnitario * item.quantidade)}
              </div>

              <button className={styles.remover} onClick={() => removerItem(item.id)}>
                Remover
              </button>

            </div>
          ))}

        </div>


        <div className={styles.resumo}>

          <h2>Resumo do Pedido</h2>

          <div className={styles["linha-resumo"]}>
            <span>Subtotal</span>
            <span>{formatarPreco(subtotal)}</span>
          </div>

          <div className={styles["linha-resumo"]}>
            <span>Entrega</span>
            <span>{frete === 0 ? "Grátis" : formatarPreco(frete)}</span>
          </div>

          <div className={`${styles["linha-resumo"]} ${styles.total}`}>
            <span>Total</span>
            <span>{formatarPreco(total)}</span>
          </div>

          <button className={styles.finalizar} onClick={() => setPagamentoAberto(true)}>
            Finalizar Compra
          </button>

        </div>

      </div>

      <PaymentModal
        open={pagamentoAberto}
        total={formatarPreco(total)}
        onClose={() => setPagamentoAberto(false)}
        onConfirmar={handleConfirmarPagamento}
      />

    </div>
  );
}
