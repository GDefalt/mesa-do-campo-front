"use client";

import { useEffect, useState } from "react";
import styles from "./MeusProdutos.module.css";
import Paginacao from "../ui/Paginacao";
import { formatarPreco } from "../../lib/formatarPreco";
import {
  listarProdutosPorVendedorPaginado,
  buscarMeusProdutosPorNome,
  criarProduto,
  atualizarProduto,
  deletarProduto,
  Produto,
  CategoriaProduto,
  CATEGORIA_PRODUTO,
  CATEGORIA_PRODUTO_LABEL,
  ApiError,
} from "@integracao-backend";

const TAMANHO_LOTE = 10;

interface Props {
  idVendedor: number;
}

interface FormState {
  nome: string;
  categoria: CategoriaProduto;
  preco: string;
  quantidade: string;
  descricao: string;
}

const formVazio: FormState = {
  nome: "",
  categoria: "OUTROS",
  preco: "",
  quantidade: "",
  descricao: "",
};

export default function MeusProdutos({ idVendedor }: Props) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [lote, setLote] = useState(1);
  const [totalItens, setTotalItens] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [termoBusca, setTermoBusca] = useState("");

  const [formAberto, setFormAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(formVazio);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const buscandoPorNome = termoBusca.trim().length > 0;

  function carregar() {
    setCarregando(true);
    setErro("");

    const busca = buscandoPorNome
      ? buscarMeusProdutosPorNome(termoBusca.trim()).then((itens) => ({
          itens,
          totalItens: itens.length,
          totalPaginas: 1,
          paginaAtual: 1,
          tamanhoPagina: itens.length,
        }))
      : listarProdutosPorVendedorPaginado(idVendedor, { lote, limite: TAMANHO_LOTE });

    busca
      .then((resultado) => {
        setProdutos(resultado.itens);
        setTotalItens(resultado.totalItens);
        setTotalPaginas(resultado.totalPaginas);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setProdutos([]);
          setTotalItens(0);
          setTotalPaginas(1);
        } else {
          setErro(err instanceof ApiError ? err.message : "Não foi possível carregar seus produtos.");
        }
      })
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idVendedor, lote, termoBusca]);

  function abrirNovo() {
    setForm(formVazio);
    setEditandoId(null);
    setFormAberto(true);
    setErroForm("");
  }

  function abrirEdicao(produto: Produto) {
    setForm({
      nome: produto.nome,
      categoria: produto.categoria,
      preco: String(produto.preco),
      quantidade: String(produto.quantidade),
      descricao: produto.descricao ?? "",
    });
    setEditandoId(produto.id);
    setFormAberto(true);
    setErroForm("");
  }

  function fecharForm() {
    setFormAberto(false);
    setEditandoId(null);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErroForm("");
    setSalvando(true);

    try {
      if (editandoId != null) {
        await atualizarProduto({
          id: editandoId,
          idVendedor,
          nome: form.nome,
          preco: Number(form.preco) || 0,
          quantidade: Number(form.quantidade) || 0,
          categoria: form.categoria,
          descricao: form.descricao,
        });
      } else {
        await criarProduto({
          idVendedor,
          nome: form.nome,
          preco: Number(form.preco) || 0,
          quantidade: Number(form.quantidade) || 0,
          categoria: form.categoria,
          descricao: form.descricao,
        });
      }

      fecharForm();
      carregar();
    } catch (err) {
      setErroForm(err instanceof ApiError ? err.message : "Não foi possível salvar o produto.");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id: number) {
    if (!window.confirm("Remover este produto do catálogo?")) return;

    try {
      await deletarProduto(id);
      carregar();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Não foi possível remover o produto.");
    }
  }

  return (
    <div>
      <div className={styles.cabecalho}>
        <div>
          <h2>Meus produtos</h2>
          <p>Controle seu catálogo, estoque e preços em um só lugar.</p>
        </div>
        <button className={styles.btnAdicionar} onClick={formAberto ? fecharForm : abrirNovo}>
          {formAberto ? "Cancelar" : "+ Novo produto"}
        </button>
      </div>

      <form
        className={styles.busca}
        onSubmit={(evento) => {
          evento.preventDefault();
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.buscaIcon}>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        <input
          value={termoBusca}
          onChange={(evento) => setTermoBusca(evento.target.value)}
          placeholder="Pesquisar nos meus produtos"
          aria-label="Pesquisar nos meus produtos"
        />
        {buscandoPorNome && (
          <button type="button" className={styles.limparBusca} onClick={() => setTermoBusca("")}>
            Limpar
          </button>
        )}
      </form>

      {formAberto && (
        <form className={styles.form} onSubmit={salvar}>
          <label className={styles.campo}>
            Nome do produto
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          </label>

          <label className={styles.campo}>
            Categoria
            <select
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value as CategoriaProduto })}
            >
              {CATEGORIA_PRODUTO.map((c) => (
                <option key={c} value={c}>
                  {CATEGORIA_PRODUTO_LABEL[c]}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.campo}>
            Preço (R$)
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.preco}
              onChange={(e) => setForm({ ...form, preco: e.target.value })}
              required
            />
          </label>

          <label className={styles.campo}>
            Estoque
            <input
              type="number"
              min="0"
              value={form.quantidade}
              onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
              required
            />
          </label>

          <label className={`${styles.campo} ${styles.campoLargo}`}>
            Descrição
            <textarea
              rows={2}
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </label>

          {erroForm && <p className={styles.erro}>{erroForm}</p>}

          <button type="submit" className={styles.btnSalvar} disabled={salvando}>
            {salvando ? "Salvando..." : editandoId != null ? "Salvar alterações" : "Cadastrar produto"}
          </button>
        </form>
      )}

      {carregando ? (
        <p className={styles.vazio}>Carregando produtos...</p>
      ) : erro ? (
        <p className={styles.vazio}>{erro}</p>
      ) : (
        <div className={styles.tabela}>
          <div className={styles.linhaCabecalho}>
            <span>Produto</span>
            <span>Preço</span>
            <span>Estoque</span>
            <span>Edição</span>
          </div>

          {produtos.map((produto) => (
            <div className={styles.linha} key={produto.id}>
              <div>
                <span className={styles.produtoNome}>{produto.nome}</span>
                <span className={styles.produtoCategoria}>{CATEGORIA_PRODUTO_LABEL[produto.categoria]}</span>
              </div>
              <span>{formatarPreco(produto.preco)}</span>
              <span>
                {produto.quantidade} un.
                {produto.quantidade === 0 && <span className={styles.statusPausado}> • Esgotado</span>}
              </span>
              <div className={styles.acoesLinha}>
                <button className={styles.btnEditar} onClick={() => abrirEdicao(produto)}>
                  Editar
                </button>
                <button className={styles.btnRemover} onClick={() => remover(produto.id)}>
                  Remover
                </button>
              </div>
            </div>
          ))}

          {produtos.length === 0 && (
            <p className={styles.vazio}>
              {buscandoPorNome ? "Nenhum produto encontrado para esta busca." : "Você ainda não cadastrou produtos."}
            </p>
          )}
        </div>
      )}

      {!buscandoPorNome && !carregando && !erro && (
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
