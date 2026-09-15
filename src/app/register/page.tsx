"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../register/page.module.css";
import { cadastrarCliente, salvarCredenciais, ApiError } from "@integracao-backend";

export default function Register() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      const cliente = await cadastrarCliente({
        nome,
        cpfCnpj: cpfCnpj.replace(/\D/g, ""),
        email,
        senha,
      });

      // Já autentica automaticamente após o cadastro.
      salvarCredenciais({ nome: cliente.nome, senha });

      router.push("/");
    } catch (err) {
      const mensagem =
        err instanceof ApiError ? err.message : "Não foi possível concluir o cadastro. Tente novamente.";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className={styles.body_register}>
      <div className={styles.header}>
        <div className={styles.logo_container}>
          <img src="/icon.png" className={styles.logo} alt="Logo Mesa do Campo" />
          <h1>Mesa do Campo</h1>
        </div>
      </div>

      <div className={styles.main_register}>
        <div className={styles.login_card}>
          <h2>CADASTRAR</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Nome Completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="CPF/CNPJ"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirmar Senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />

            {erro && <p className={styles.erro}>{erro}</p>}

            <button type="submit" disabled={carregando}>
              {carregando ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>

          <p className={styles.logar}>
            Já tem uma conta ? Faça <Link href="/login">login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
