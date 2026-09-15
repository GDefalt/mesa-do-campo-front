"use client";

import { useState } from "react";
import styles from "./PerfilTabs.module.css";
import { atualizarCliente, atualizarSenhaCliente, ClienteDTO, ApiError } from "@integracao-backend";

interface Props {
  cliente: ClienteDTO;
  onAtualizar: (cliente: ClienteDTO) => void;
}

export default function MeusDados({ cliente, onAtualizar }: Props) {
  const [nome, setNome] = useState(cliente.nome);
  const [telefone, setTelefone] = useState(cliente.telefone ?? "");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
    setErro("");

    if (novaSenha && novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setSalvando(true);

    try {
      const atualizado = await atualizarCliente({ ...cliente, nome, telefone });
      onAtualizar(atualizado);

      if (novaSenha) {
        await atualizarSenhaCliente(novaSenha);
      }

      setNovaSenha("");
      setConfirmarSenha("");
      setMensagem("Dados atualizados com sucesso!");
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível salvar suas alterações.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form className={styles.formulario} onSubmit={handleSubmit}>
      <label className={styles.campo}>
        Nome completo
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome completo"
          required
        />
      </label>

      <div className={styles.linhaDupla}>
        <label className={styles.campo}>
          E-mail
          <input type="email" value={cliente.email} disabled title="O e-mail não pode ser alterado." />
        </label>

        <label className={styles.campo}>
          CPF/CNPJ
          <input type="text" value={cliente.cpfOrCnpj} disabled title="O CPF/CNPJ não pode ser alterado." />
        </label>
      </div>

      <label className={styles.campo}>
        Telefone
        <input
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="(00) 00000-0000"
        />
      </label>

      <div className={styles.linhaDupla}>
        <label className={styles.campo}>
          Nova senha
          <input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Deixe em branco para manter"
          />
        </label>

        <label className={styles.campo}>
          Confirmar nova senha
          <input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            placeholder="Repita a nova senha"
          />
        </label>
      </div>

      {novaSenha && (
        <p className={styles.dica}>
          A senha precisa ter 8+ caracteres, com ao menos 1 letra maiúscula, 1 número e 1 caractere especial.
        </p>
      )}

      <button type="submit" className={styles.btnPrimario} disabled={salvando}>
        {salvando ? "Salvando..." : "Salvar alterações"}
      </button>

      {mensagem && <p className={styles.mensagem}>{mensagem}</p>}
      {erro && <p className={styles.erro}>{erro}</p>}
    </form>
  );
}
