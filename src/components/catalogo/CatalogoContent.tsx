"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import styles from "./CatalogoContent.module.css";
import Cards from "../Cards";
import Paginacao from "../ui/Paginacao";
import { useTodosProdutos } from "../../hooks/useTodosProdutos";
import { imagemDoProduto } from "../../lib/produtoImagem";
import { formatarPreco } from "../../lib/formatarPreco";
import {
  listarTodosProdutosPaginado,
  listarProdutosPorCategoriaPaginado,
  Produto,
  CategoriaProduto,
  CATEGORIA_PRODUTO,
  CATEGORIA_PRODUTO_LABEL,
  ApiError,
} from "@integracao-backend";

const TAMANHO_LOTE = 15;

const categorias: Array<CategoriaProduto | "TODAS"> = ["TODAS", ...CATEGORIA_PRODUTO];

function rotuloCategoria(categoria: CategoriaProduto | "TODAS") {
  return categoria === "TODAS" ? "Todas" : CATEGORIA_PRODUTO_LABEL[categoria];
}

export default function CatalogoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const termoInicial = searchParams.get("q") ?? "";
  const modoBusca = termoInicial.trim().length > 0;

  const [termo, setTermo] = useState(termoInicial);
  const [categoria, setCategoria] = useState<CategoriaProduto | "TODAS">("TODAS");

  // Modo busca: como o back-end não tem busca por nome, carregamos tudo e
  // filtramos no front (sem paginação, já que precisamos varrer tudo mesmo).
  const { produtos: todosProdutos, carregando: carregandoBusca, erro: erroBusca } = useTodosProdutos();

  const resultadosBusca = useMemo(() => {
    const termoNormalizado = termoInicial.trim().toLowerCase();
    return todosProdutos.filter((produto) => produto.nome.toLowerCase().includes(termoNormalizado));
  }, [todosProdutos, termoInicial]);

  // Modo navegação (sem busca): pedimos ao back-end em lotes, por categoria
  // quando um filtro estiver selecionado.
  const [lote, setLote] = useState(1);
  const [produtosPagina, setProdutosPagina] = useState<Produto[]>([]);
  const [totalItens, setTotalItens] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregandoPagina, setCarregandoPagina] = useState(true);
  const [erroPagina, setErroPagina] = useState("");

  useEffect(() => {
    setLote(1);
  }, [categoria]);

  useEffect(() => {
    if (modoBusca) return;

    let cancelado = false;
    setCarregandoPagina(true);
    setErroPagina("");

    const busca =
      categoria === "TODAS"
        ? listarTodosProdutosPaginado({ lote, limite: TAMANHO_LOTE })
        : listarProdutosPorCategoriaPaginado(categoria, { lote, limite: TAMANHO_LOTE });

    busca
      .then((resultado) => {
        if (cancelado) return;
        setProdutosPagina(resultado.itens);
        setTotalItens(resultado.totalItens);
        setTotalPaginas(resultado.totalPaginas);
      })
      .catch((err) => {
        if (cancelado) return;
        if (err instanceof ApiError && err.status === 404) {
          setProdutosPagina([]);
          setTotalItens(0);
          setTotalPaginas(1);
        } else {
          setErroPagina(err instanceof ApiError ? err.message : "Não foi possível carregar os produtos.");
        }
      })
      .finally(() => {
        if (!cancelado) setCarregandoPagina(false);
      });

    return () => {
      cancelado = true;
    };
  }, [modoBusca, categoria, lote]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (termo.trim()) {
      router.push(`/catalogo?q=${encodeURIComponent(termo.trim())}`);
    } else {
      router.push("/catalogo");
    }
  }

  function limparBusca() {
    setTermo("");
    router.push("/catalogo");
  }

  const resultados = modoBusca ? resultadosBusca : produtosPagina;
  const carregando = modoBusca ? carregandoBusca : carregandoPagina;
  const erro = modoBusca ? erroBusca : erroPagina;

  return (
    <div className={styles.body}>
      <div className={styles.topo}>
        <h1>Catálogo de Produtos</h1>
        <p className={styles.subtitulo}>
          Conheça tudo o que os pequenos produtores da região têm para oferecer.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.icon}>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar por frutas, verduras, laticínios..."
          />
          <button type="submit">Buscar</button>
        </form>

        {!modoBusca && (
          <div className={styles.categorias}>
            {categorias.map((c) => (
              <button
                key={c}
                className={`${styles.chip} ${categoria === c ? styles.chipAtivo : ""}`}
                onClick={() => setCategoria(c)}
              >
                {rotuloCategoria(c)}
              </button>
            ))}
          </div>
        )}

        {!carregando && !erro && (
          <p className={styles.contagem}>
            {modoBusca ? (
              <>
                {resultados.length} resultado(s) para "{termoInicial}"{" "}
                <button className={styles.limpar} onClick={limparBusca}>
                  Limpar busca
                </button>
              </>
            ) : (
              `${totalItens} produto(s) disponível(is)`
            )}
          </p>
        )}
      </div>

      {carregando ? (
        <p className={styles.contagem} style={{ textAlign: "center" }}>
          Carregando produtos...
        </p>
      ) : erro ? (
        <p className={styles.contagem} style={{ textAlign: "center" }}>
          {erro}
        </p>
      ) : resultados.length > 0 ? (
        <>
          <div className={styles.grid}>
            {resultados.map((produto) => (
              <Cards
                key={produto.id}
                id={produto.id}
                imagem={imagemDoProduto(produto.categoria)}
                titulo={CATEGORIA_PRODUTO_LABEL[produto.categoria]}
                nome={produto.nome}
                preco={formatarPreco(produto.preco)}
                precoNumerico={produto.preco}
              />
            ))}
          </div>

          {!modoBusca && (
            <Paginacao
              paginaAtual={lote}
              totalPaginas={totalPaginas}
              totalItens={totalItens}
              onMudarPagina={setLote}
            />
          )}
        </>
      ) : (
        <div className={styles.vazio}>
          <img src="/carrinho.svg" alt="" className={styles.vazioIcon} />
          <p>Não encontramos produtos para essa busca.</p>
          <span>Tente termos como "frutas", "cebola" ou "laticínios".</span>
        </div>
      )}
    </div>
  );
}
