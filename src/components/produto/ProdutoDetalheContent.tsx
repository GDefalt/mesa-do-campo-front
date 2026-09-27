"use client";

import { useEffect, useState } from "react";
import styles from "../../app/produto/[id]/page.module.css";
import { useCart } from "../../context/CartContext";
import { imagemDoProduto } from "../../lib/produtoImagem";
import {
  getProdutoPorId,
  listarVendedores,
  Produto,
  VendedorDTO,
  CATEGORIA_PRODUTO_LABEL,
  ApiError,
} from "@integracao-backend";

interface Props {
  id: number;
}

export default function ProdutoDetalheContent({ id }: Props) {
  const { adicionarItem } = useCart();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [vendedor, setVendedor] = useState<VendedorDTO | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);

  useEffect(() => {
    let cancelado = false;

    getProdutoPorId(id)
      .then((dados) => {
        if (cancelado) return;
        setProduto(dados);

        // Melhor esforço: mostra o nome do vendedor se conseguirmos encontrá-lo
        // na listagem pública (não existe um GET de vendedor por id isolado).
        listarVendedores()
          .then((vendedores) => {
            if (!cancelado) {
              setVendedor(vendedores.find((v) => v.idVendedor === dados.idVendedor) ?? null);
            }
          })
          .catch(() => {
            /* seção de vendedor é apenas um extra — falha aqui é silenciosa */
          });
      })
      .catch((err) => {
        if (!cancelado) {
          setErro(err instanceof ApiError ? err.message : "Não foi possível carregar este produto.");
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

  function diminuir() {
    setQuantidade((q) => Math.max(1, q - 1));
  }

  function aumentar() {
    setQuantidade((q) => (produto ? Math.min(produto.quantidade, q + 1) : q + 1));
  }

  function handleAdicionar() {
    if (!produto) return;

    adicionarItem(
      {
        id: produto.id,
        nome: produto.nome,
        imagem: imagemDoProduto(produto.categoria),
        precoUnitario: produto.preco,
      },
      quantidade
    );
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 2000);
  }

  if (carregando) {
    return <p className={styles.mensagem}>Carregando produto...</p>;
  }

  if (erro || !produto) {
    return <p className={styles.mensagem}>{erro || "Produto não encontrado."}</p>;
  }

  const semEstoque = produto.quantidade <= 0;
  const totalItem = produto.preco * quantidade;

  return (
    <div>
      <div className={styles.produto}>
        <div className={styles.produtoImagem}>
          <img src={imagemDoProduto(produto.categoria)} alt={produto.nome} />
        </div>

        <div className={styles.produtoDetalhes}>
          <h1>{produto.nome}</h1>

          <p className={styles.categoria}>
            {CATEGORIA_PRODUTO_LABEL[produto.categoria]}
            {vendedor && ` • Vendido por ${vendedor.nome}`}
          </p>

          {produto.descricao && <p className={styles.descricao}>{produto.descricao}</p>}

          <div className={styles.preco}>
            R$ {produto.preco.toFixed(2).replace(".", ",")}
          </div>

          {semEstoque ? (
            <p className={styles.mensagem}>Produto sem estoque no momento.</p>
          ) : (
            <>
              <div className={styles.quantidadeContainer}>
                <button className={styles.btnQtd} onClick={diminuir}>
                  -
                </button>

                <input type="number" value={quantidade} min={1} max={produto.quantidade} readOnly />

                <button className={styles.btnQtd} onClick={aumentar}>
                  +
                </button>
              </div>

              <button className={styles.btnAdicionar} onClick={handleAdicionar}>
                {adicionado
                  ? "Adicionado ao carrinho ✓"
                  : `Adicionar ao Carrinho • R$ ${totalItem.toFixed(2).replace(".", ",")}`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
