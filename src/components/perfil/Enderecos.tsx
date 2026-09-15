"use client";

import { useEffect, useState } from "react";
import styles from "./PerfilTabs.module.css";
import {
  listarMeusEnderecos,
  criarEndereco,
  atualizarEndereco,
  deletarEndereco,
  buscarCep,
  Endereco,
  ApiError,
} from "@integracao-backend";

interface Props {
  idCliente: number;
}

interface FormState {
  cep: string;
  adress: string;
  number: string;
  complement: string;
  city: string;
  state: string;
}

const formVazio: FormState = {
  cep: "",
  adress: "",
  number: "",
  complement: "",
  city: "",
  state: "",
};

export default function Enderecos({ idCliente }: Props) {
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [formAberto, setFormAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(formVazio);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState("");

  function carregar() {
    setCarregando(true);
    listarMeusEnderecos()
      .then(setEnderecos)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setEnderecos([]);
        } else {
          setErro(err instanceof ApiError ? err.message : "Não foi possível carregar seus endereços.");
        }
      })
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCliente]);

  function abrirNovo() {
    setForm(formVazio);
    setEditandoId(null);
    setFormAberto(true);
    setErroForm("");
  }

  function abrirEdicao(endereco: Endereco) {
    setForm({
      cep: endereco.cep,
      adress: endereco.adress ?? "",
      number: endereco.number != null ? String(endereco.number) : "",
      complement: endereco.complement ?? "",
      city: endereco.city ?? "",
      state: endereco.state ?? "",
    });
    setEditandoId(endereco.id);
    setFormAberto(true);
    setErroForm("");
  }

  function fecharForm() {
    setFormAberto(false);
    setEditandoId(null);
  }

  async function handleCepBlur() {
    const cepLimpo = form.cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    const resultado = await buscarCep(cepLimpo);
    setBuscandoCep(false);

    if (resultado) {
      setForm((atual) => ({ ...atual, state: resultado.state, city: resultado.city, adress: resultado.street }));
    }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErroForm("");
    setSalvando(true);

    try {
      if (editandoId != null) {
        await atualizarEndereco({
          id: editandoId,
          idUsuario: idCliente,
          cep: form.cep,
          country: "Brasil",
          state: form.state,
          city: form.city,
          adress: form.adress,
          number: Number(form.number) || undefined,
          complement: form.complement,
        });
      } else {
        await criarEndereco({
          idUsuario: idCliente,
          cep: form.cep,
          country: "Brasil",
          state: form.state,
          city: form.city,
          adress: form.adress,
          number: Number(form.number) || undefined,
          complement: form.complement,
        });
      }

      fecharForm();
      carregar();
    } catch (err) {
      setErroForm(err instanceof ApiError ? err.message : "Não foi possível salvar o endereço.");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id: number) {
    if (!window.confirm("Remover este endereço?")) return;

    try {
      await deletarEndereco(id);
      carregar();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Não foi possível remover o endereço.");
    }
  }

  return (
    <div>
      <div className={styles.cabecalhoEnderecos}>
        <div>
          <h2 className={styles.tituloSecao}>Meus endereços</h2>
          <p className={styles.introducao}>Endereços que você pode usar para receber pedidos ou vender produtos.</p>
        </div>
        <button className={styles.btnPrimario} onClick={formAberto ? fecharForm : abrirNovo}>
          {formAberto ? "Cancelar" : "+ Cadastrar novo endereço"}
        </button>
      </div>

      {formAberto && (
        <form className={styles.formulario} onSubmit={salvar} style={{ marginBottom: "1.5rem" }}>
          <label className={styles.campo}>
            CEP
            <input
              type="text"
              value={form.cep}
              onChange={(e) => setForm({ ...form, cep: e.target.value })}
              onBlur={handleCepBlur}
              placeholder="00000-000"
              required
            />
          </label>
          {buscandoCep && <p className={styles.dica}>Buscando endereço pelo CEP...</p>}

          <label className={styles.campo}>
            Rua
            <input
              type="text"
              value={form.adress}
              onChange={(e) => setForm({ ...form, adress: e.target.value })}
              required
            />
          </label>

          <div className={styles.linhaDupla}>
            <label className={styles.campo}>
              Número
              <input
                type="text"
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                required
              />
            </label>

            <label className={styles.campo}>
              Complemento
              <input
                type="text"
                value={form.complement}
                onChange={(e) => setForm({ ...form, complement: e.target.value })}
              />
            </label>
          </div>

          <div className={styles.linhaDupla}>
            <label className={styles.campo}>
              Cidade
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
            </label>

            <label className={styles.campo}>
              Estado
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                required
              />
            </label>
          </div>

          {erroForm && <p className={styles.erro}>{erroForm}</p>}

          <button type="submit" className={styles.btnPrimario} disabled={salvando}>
            {salvando ? "Salvando..." : editandoId != null ? "Salvar alterações" : "Cadastrar endereço"}
          </button>
        </form>
      )}

      {carregando ? (
        <p className={styles.mensagem}>Carregando endereços...</p>
      ) : erro ? (
        <p className={styles.erro}>{erro}</p>
      ) : enderecos.length === 0 ? (
        <p className={styles.mensagem}>Você ainda não tem nenhum endereço cadastrado.</p>
      ) : (
        <div className={styles.listaEnderecos}>
          {enderecos.map((endereco) => (
            <div className={styles.enderecoItem} key={endereco.id}>
              <div className={styles.enderecoIcone}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </div>
              <div className={styles.enderecoInfo}>
                <span className={styles.enderecoLinha1}>
                  {endereco.adress}, {endereco.number}
                  {endereco.complement ? ` — ${endereco.complement}` : ""}
                </span>
                <span className={styles.enderecoLinha2}>
                  {endereco.city} - {endereco.state} · CEP {endereco.cep}
                </span>
              </div>
              <div className={styles.acoesLinha}>
                <button className={styles.btnEditar} onClick={() => abrirEdicao(endereco)}>
                  Editar
                </button>
                <button className={styles.btnRemover} onClick={() => remover(endereco.id)}>
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
