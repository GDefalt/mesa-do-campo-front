"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./PerfilTabs.module.css";
import {
  listarMeusEnderecos,
  atualizarEnderecoEntrega,
  criarVendedor,
  listarMeusCartoesCredito,
  listarMeusCartoesDebito,
  listarMinhasChavesPix,
  Endereco,
  Cartao,
  ChavePix,
  ClienteDTO,
  TipoPagamento,
  ApiError,
} from "@integracao-backend";

interface Props {
  cliente: ClienteDTO;
  souVendedor: boolean;
  onCadastrado: () => void;
}

type MetodoSalvo =
  | { origem: "pix"; chave: ChavePix }
  | { origem: "cartao"; cartao: Cartao };

function chaveDoMetodo(metodo: MetodoSalvo): string {
  return metodo.origem === "pix" ? `pix-${metodo.chave.id}` : `cartao-${metodo.cartao.id}`;
}

function rotuloDoMetodo(metodo: MetodoSalvo): string {
  if (metodo.origem === "pix") {
    return `${metodo.chave.nome} — ${metodo.chave.tipoChave}: ${metodo.chave.chave}`;
  }
  return `${metodo.cartao.nome} — ${metodo.cartao.bandeira} •••• ${metodo.cartao.ultimosDigitos}`;
}

function contaRecebimentoDoMetodo(metodo: MetodoSalvo): string {
  if (metodo.origem === "pix") {
    return `${metodo.chave.tipoChave}: ${metodo.chave.chave}`;
  }
  return `${metodo.cartao.bandeira} •••• ${metodo.cartao.ultimosDigitos} (${metodo.cartao.nome})`;
}

export default function QueroSerVendedor({ cliente, souVendedor, onCadastrado }: Props) {
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [carregandoEnderecos, setCarregandoEnderecos] = useState(true);
  const [idEnderecoSelecionado, setIdEnderecoSelecionado] = useState<number | null>(null);

  const [chavesPix, setChavesPix] = useState<ChavePix[]>([]);
  const [cartoesCredito, setCartoesCredito] = useState<Cartao[]>([]);
  const [cartoesDebito, setCartoesDebito] = useState<Cartao[]>([]);
  const [carregandoMetodos, setCarregandoMetodos] = useState(true);

  const [tipoPagamento, setTipoPagamento] = useState<TipoPagamento>("PIX");
  const [metodoSelecionado, setMetodoSelecionado] = useState<string>("manual");
  const [contaRecebimento, setContaRecebimento] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    listarMeusEnderecos()
      .then((lista) => {
        setEnderecos(lista);
        if (lista.length > 0) {
          setIdEnderecoSelecionado(cliente.idEnderecoEntrega ?? lista[0].id);
        }
      })
      .catch(() => setEnderecos([]))
      .finally(() => setCarregandoEnderecos(false));

    Promise.all([
      listarMinhasChavesPix().catch(() => []),
      listarMeusCartoesCredito().catch(() => []),
      listarMeusCartoesDebito().catch(() => []),
    ])
      .then(([pix, credito, debito]) => {
        setChavesPix(pix);
        setCartoesCredito(credito);
        setCartoesDebito(debito);
      })
      .finally(() => setCarregandoMetodos(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Métodos já cadastrados pelo usuário, filtrados pelo tipo escolhido acima.
  const metodosFiltrados: MetodoSalvo[] = useMemo(() => {
    if (tipoPagamento === "PIX") return chavesPix.map((chave) => ({ origem: "pix" as const, chave }));
    if (tipoPagamento === "CREDITO") return cartoesCredito.map((cartao) => ({ origem: "cartao" as const, cartao }));
    return cartoesDebito.map((cartao) => ({ origem: "cartao" as const, cartao }));
  }, [tipoPagamento, chavesPix, cartoesCredito, cartoesDebito]);

  function trocarTipoPagamento(tipo: TipoPagamento) {
    setTipoPagamento(tipo);
    setContaRecebimento("");
    setMetodoSelecionado("manual");
  }

  function selecionarMetodo(metodo: MetodoSalvo) {
    setMetodoSelecionado(chaveDoMetodo(metodo));
    setContaRecebimento(contaRecebimentoDoMetodo(metodo));
  }

  function selecionarManual() {
    setMetodoSelecionado("manual");
    setContaRecebimento("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (idEnderecoSelecionado == null) {
      setErro("Selecione um endereço para vender seus produtos.");
      return;
    }

    if (!contaRecebimento.trim()) {
      setErro("Informe como você quer receber pelos pedidos.");
      return;
    }

    setEnviando(true);

    try {
      await atualizarEnderecoEntrega(idEnderecoSelecionado);

      await criarVendedor({
        idVendedor: cliente.id,
        contaRecebimento,
        tipoPagamento,
        dataAdmissao: new Date().toISOString().slice(0, 10),
      });

      setEnviado(true);
      onCadastrado();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível concluir o cadastro de vendedor.");
    } finally {
      setEnviando(false);
    }
  }

  if (souVendedor || enviado) {
    return (
      <div className={styles.aviso}>
        <div className={styles.avisoIcon}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="m5 13 4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3>Você já é um vendedor Mesa do Campo!</h3>
        <p>
          Acesse a área "Meu Negócio" no menu superior para cadastrar produtos e
          acompanhar suas vendas.
        </p>
        <Link href="/negocio" className={styles.btnPrimario}>
          Ir para Meu Negócio
        </Link>
      </div>
    );
  }

  return (
    <form className={styles.formulario} onSubmit={handleSubmit}>
      <p className={styles.introducao}>
        Escolha o endereço de onde você vai vender seus produtos e como
        prefere receber pelos pedidos.
      </p>

      <h3 className={styles.subtitulo}>Endereço para venda</h3>

      {carregandoEnderecos ? (
        <p className={styles.mensagem}>Carregando seus endereços...</p>
      ) : enderecos.length === 0 ? (
        <p className={styles.mensagem}>
          Você ainda não tem nenhum endereço cadastrado.{" "}
          <Link href="/perfil?tab=enderecos" className={styles.linkInline}>
            Cadastre um endereço primeiro
          </Link>
          .
        </p>
      ) : (
        <div className={styles.selecaoEnderecos}>
          {enderecos.map((endereco) => (
            <label
              key={endereco.id}
              className={`${styles.enderecoOpcao} ${
                idEnderecoSelecionado === endereco.id ? styles.enderecoOpcaoAtiva : ""
              }`}
            >
              <input
                type="radio"
                name="endereco"
                checked={idEnderecoSelecionado === endereco.id}
                onChange={() => setIdEnderecoSelecionado(endereco.id)}
              />
              <div className={styles.enderecoInfo}>
                <span className={styles.enderecoLinha1}>
                  {endereco.adress}, {endereco.number}
                  {endereco.complement ? ` — ${endereco.complement}` : ""}
                </span>
                <span className={styles.enderecoLinha2}>
                  {endereco.city} - {endereco.state} · CEP {endereco.cep}
                </span>
              </div>
            </label>
          ))}
        </div>
      )}

      <h3 className={styles.subtitulo}>Como você quer receber</h3>

      <div className={styles.opcoesRadio}>
        <label className={styles.radioOpcao}>
          <input
            type="radio"
            name="tipoPagamento"
            checked={tipoPagamento === "PIX"}
            onChange={() => trocarTipoPagamento("PIX")}
          />
          PIX
        </label>
        <label className={styles.radioOpcao}>
          <input
            type="radio"
            name="tipoPagamento"
            checked={tipoPagamento === "DEBITO"}
            onChange={() => trocarTipoPagamento("DEBITO")}
          />
          Conta (débito)
        </label>
        <label className={styles.radioOpcao}>
          <input
            type="radio"
            name="tipoPagamento"
            checked={tipoPagamento === "CREDITO"}
            onChange={() => trocarTipoPagamento("CREDITO")}
          />
          Conta (crédito)
        </label>
      </div>

      {carregandoMetodos ? (
        <p className={styles.mensagem}>Carregando seus métodos salvos...</p>
      ) : (
        <div className={styles.selecaoEnderecos}>
          {metodosFiltrados.map((metodo) => {
            const chaveMetodo = chaveDoMetodo(metodo);
            return (
              <label
                key={chaveMetodo}
                className={`${styles.enderecoOpcao} ${
                  metodoSelecionado === chaveMetodo ? styles.enderecoOpcaoAtiva : ""
                }`}
              >
                <input
                  type="radio"
                  name="metodoRecebimento"
                  checked={metodoSelecionado === chaveMetodo}
                  onChange={() => selecionarMetodo(metodo)}
                />
                <div className={styles.enderecoInfo}>
                  <span className={styles.enderecoLinha1}>{rotuloDoMetodo(metodo)}</span>
                </div>
              </label>
            );
          })}

          {metodosFiltrados.length === 0 && (
            <p className={styles.mensagem}>
              Você ainda não tem nenhum método salvo desse tipo.{" "}
              <Link href="/perfil?tab=pagamento" className={styles.linkInline}>
                Cadastre um na aba Métodos de Pagamento
              </Link>{" "}
              ou informe manualmente abaixo.
            </p>
          )}

          <label
            className={`${styles.enderecoOpcao} ${metodoSelecionado === "manual" ? styles.enderecoOpcaoAtiva : ""}`}
          >
            <input
              type="radio"
              name="metodoRecebimento"
              checked={metodoSelecionado === "manual"}
              onChange={selecionarManual}
            />
            <div className={styles.enderecoInfo}>
              <span className={styles.enderecoLinha1}>Informar manualmente</span>
            </div>
          </label>
        </div>
      )}

      {metodoSelecionado === "manual" && (
        <label className={styles.campo}>
          Chave PIX ou dados bancários
          <input
            type="text"
            value={contaRecebimento}
            onChange={(e) => setContaRecebimento(e.target.value)}
            placeholder="Chave PIX, ou banco + agência + conta"
            required
          />
        </label>
      )}

      {erro && <p className={styles.erro}>{erro}</p>}

      <button
        type="submit"
        className={styles.btnPrimario}
        disabled={enviando || enderecos.length === 0}
      >
        {enviando ? "Enviando..." : "Quero ser um vendedor"}
      </button>
    </form>
  );
}
