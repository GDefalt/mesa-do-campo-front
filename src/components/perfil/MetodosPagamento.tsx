"use client";

import { useEffect, useState } from "react";
import styles from "./PerfilTabs.module.css";
import {
  listarMeusCartoesCredito,
  criarCartaoCredito,
  deletarCartaoCredito,
  listarMeusCartoesDebito,
  criarCartaoDebito,
  deletarCartaoDebito,
  listarMinhasChavesPix,
  criarChavePix,
  deletarChavePix,
  Cartao,
  ChavePix,
  ApiError,
} from "@integracao-backend";

type TipoMetodo = "CREDITO" | "DEBITO" | "PIX";

interface Props {
  idCliente: number;
}

interface MetodoExibicao {
  tipo: TipoMetodo;
  id: number;
  rotulo: string;
  detalhe: string;
}

export default function MetodosPagamento({ idCliente }: Props) {
  const [cartoesCredito, setCartoesCredito] = useState<Cartao[]>([]);
  const [cartoesDebito, setCartoesDebito] = useState<Cartao[]>([]);
  const [chavesPix, setChavesPix] = useState<ChavePix[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [tipoNovo, setTipoNovo] = useState<TipoMetodo>("PIX");
  const [nome, setNome] = useState("");
  const [numero, setNumero] = useState("");
  const [bandeira, setBandeira] = useState("");
  const [tipoChave, setTipoChave] = useState("CPF");
  const [chave, setChave] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  function carregarTudo() {
    setCarregando(true);
    Promise.all([
      listarMeusCartoesCredito().catch(() => []),
      listarMeusCartoesDebito().catch(() => []),
      listarMinhasChavesPix().catch(() => []),
    ]).then(([credito, debito, pix]) => {
      setCartoesCredito(credito);
      setCartoesDebito(debito);
      setChavesPix(pix);
      setCarregando(false);
    });
  }

  useEffect(() => {
    carregarTudo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    try {
      if (tipoNovo === "PIX") {
        await criarChavePix({ idCliente, nome, tipoChave, chave, padrao: chavesPix.length === 0 });
      } else {
        const ultimosDigitos = Number(numero.replace(/\D/g, "").slice(-4)) || 0;
        const tokenGateway = `tok_${Math.random().toString(36).slice(2, 12)}`;
        const dados = {
          idCliente,
          nome,
          bandeira,
          ultimosDigitos,
          tokenGateway,
          padrao: tipoNovo === "CREDITO" ? cartoesCredito.length === 0 : cartoesDebito.length === 0,
        };
        if (tipoNovo === "CREDITO") await criarCartaoCredito(dados);
        else await criarCartaoDebito(dados);
      }

      setNome("");
      setNumero("");
      setBandeira("");
      setChave("");
      carregarTudo();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível salvar esse método de pagamento.");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(metodo: MetodoExibicao) {
    try {
      if (metodo.tipo === "CREDITO") await deletarCartaoCredito(metodo.id);
      else if (metodo.tipo === "DEBITO") await deletarCartaoDebito(metodo.id);
      else await deletarChavePix(metodo.id);
      carregarTudo();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Não foi possível remover.");
    }
  }

  const metodos: MetodoExibicao[] = [
    ...cartoesCredito.map((c) => ({ tipo: "CREDITO" as const, id: c.id, rotulo: `${c.nome} (crédito)`, detalhe: `${c.bandeira} •••• ${c.ultimosDigitos}` })),
    ...cartoesDebito.map((c) => ({ tipo: "DEBITO" as const, id: c.id, rotulo: `${c.nome} (débito)`, detalhe: `${c.bandeira} •••• ${c.ultimosDigitos}` })),
    ...chavesPix.map((p) => ({ tipo: "PIX" as const, id: p.id, rotulo: `${p.nome} (PIX)`, detalhe: `${p.tipoChave}: ${p.chave}` })),
  ];

  return (
    <div>
      {carregando ? (
        <p className={styles.mensagem}>Carregando métodos de pagamento...</p>
      ) : metodos.length > 0 ? (
        <div className={styles.listaCartoes}>
          {metodos.map((metodo) => (
            <div className={styles.cartaoItem} key={`${metodo.tipo}-${metodo.id}`}>
              <div className={styles.cartaoIcone}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M3 10h18" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </div>
              <div className={styles.cartaoInfo}>
                <span className={styles.cartaoApelido}>{metodo.rotulo}</span>
                <span className={styles.cartaoNumero}>{metodo.detalhe}</span>
              </div>
              <button className={styles.btnRemover} onClick={() => remover(metodo)}>
                Remover
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.mensagem}>Você ainda não tem métodos de pagamento salvos.</p>
      )}

      <form className={styles.formulario} onSubmit={handleSubmit}>
        <h3 className={styles.subtitulo}>Adicionar método de pagamento</h3>

        <div className={styles.opcoesRadio}>
          <label className={styles.radioOpcao}>
            <input type="radio" checked={tipoNovo === "PIX"} onChange={() => setTipoNovo("PIX")} />
            Chave PIX
          </label>
          <label className={styles.radioOpcao}>
            <input type="radio" checked={tipoNovo === "CREDITO"} onChange={() => setTipoNovo("CREDITO")} />
            Cartão de crédito
          </label>
          <label className={styles.radioOpcao}>
            <input type="radio" checked={tipoNovo === "DEBITO"} onChange={() => setTipoNovo("DEBITO")} />
            Cartão de débito
          </label>
        </div>

        <label className={styles.campo}>
          Apelido
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder={tipoNovo === "PIX" ? "Ex: Minha chave principal" : "Ex: Cartão principal"}
            required
          />
        </label>

        {tipoNovo === "PIX" ? (
          <div className={styles.linhaDupla}>
            <label className={styles.campo}>
              Tipo de chave
              <select value={tipoChave} onChange={(e) => setTipoChave(e.target.value)}>
                <option value="CPF">CPF</option>
                <option value="EMAIL">E-mail</option>
                <option value="TELEFONE">Telefone</option>
                <option value="ALEATORIA">Aleatória</option>
              </select>
            </label>

            <label className={styles.campo}>
              Chave
              <input type="text" value={chave} onChange={(e) => setChave(e.target.value)} required />
            </label>
          </div>
        ) : (
          <>
            <label className={styles.campo}>
              Bandeira
              <input
                type="text"
                value={bandeira}
                onChange={(e) => setBandeira(e.target.value)}
                placeholder="Ex: Visa, Mastercard"
                required
              />
            </label>

            <label className={styles.campo}>
              Número do cartão
              <input
                type="text"
                inputMode="numeric"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="0000 0000 0000 0000"
                required
              />
            </label>
          </>
        )}

        {erro && <p className={styles.erro}>{erro}</p>}

        <button type="submit" className={styles.btnPrimario} disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </button>
      </form>
    </div>
  );
}
