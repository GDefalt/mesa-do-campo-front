"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../login/page.module.css";
import { resetPassword, loginCliente, salvarCredenciais, ApiError } from "@integracao-backend";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [recuperando, setRecuperando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setCarregando(true);

    try {
      const cliente = await loginCliente({ email, senha });

      salvarCredenciais({ nome: cliente.nome, senha });

      router.push("/");
    } catch (err) {
      const mensagem = err instanceof ApiError ? err.message : "Não foi possível entrar. Tente novamente.";
      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  async function handleResetPassword() {
    setErro("");
    setSucesso("");

    if (!email) {
      setErro("Por favor, digite seu e-mail no campo acima para recuperar a senha.");
      return;
    }

    setRecuperando(true);
    try {
      await resetPassword(email);
      setSucesso("Instruções de recuperação enviadas para o seu e-mail!");
    } catch (err) {
      const mensagem = err instanceof ApiError ? err.message : "Não foi possível enviar a recuperação de senha. Tente novamente.";
      setErro(mensagem);
    } finally {
      setRecuperando(false);
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
          <h2>ENTRAR</h2>

          <form onSubmit={handleSubmit}>
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

            <div className={styles.esqueciSenhaWrapper}>
              <span
                className={styles.esqueciSenha}
                onClick={() => !recuperando && handleResetPassword()}
              >
                {recuperando ? "Enviando..." : "Esqueci a senha"}
              </span>
            </div>

            {erro && <p className={styles.erro}>{erro}</p>}
            {sucesso && <p className={styles.sucesso}>{sucesso}</p>}

            <button type="submit" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className={styles.register}>
            Não tem uma conta? <Link href="/register">Cadastre-se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}