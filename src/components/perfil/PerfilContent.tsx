"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./PerfilContent.module.css";
import MeusDados from "./MeusDados";
import Enderecos from "./Enderecos";
import QueroSerVendedor from "./QueroSerVendedor";
import MetodosPagamento from "./MetodosPagamento";
import { useClienteAutenticado } from "../../hooks/useClienteAutenticado";
import { getVendedorAutenticado, ClienteDTO, ApiError } from "@integracao-backend";

const abas = [
  { chave: "dados", rotulo: "Meus Dados" },
  { chave: "enderecos", rotulo: "Endereços" },
  { chave: "vendedor", rotulo: "Quero ser um Vendedor" },
  { chave: "pagamento", rotulo: "Métodos de Pagamento" },
] as const;

type Aba = (typeof abas)[number]["chave"];

export default function PerfilContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const abaInicial = (abas.find((a) => a.chave === tabParam)?.chave ?? "dados") as Aba;

  const { cliente: clienteCarregado, carregando, erro } = useClienteAutenticado();

  const [abaAtiva, setAbaAtiva] = useState<Aba>(abaInicial);
  const [cliente, setCliente] = useState<ClienteDTO | null>(null);
  const [souVendedor, setSouVendedor] = useState(false);
  const [verificandoVendedor, setVerificandoVendedor] = useState(true);

  useEffect(() => {
    if (clienteCarregado) setCliente(clienteCarregado);
  }, [clienteCarregado]);

  useEffect(() => {
    getVendedorAutenticado()
      .then(() => setSouVendedor(true))
      .catch((err) => {
        // 404 = ainda não é vendedor, o que é um estado normal aqui.
        if (!(err instanceof ApiError && err.status === 404)) {
          console.error(err);
        }
        setSouVendedor(false);
      })
      .finally(() => setVerificandoVendedor(false));
  }, []);

  return (
    <div className={styles.body}>
      <div className={styles.topo}>
        <h1>Meu Perfil</h1>
        <p className={styles.subtitulo}>Gerencie seus dados, formas de pagamento e sua conta de vendedor.</p>
        <div className={styles.linha}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.tabs}>
          {abas.map((aba) => (
            <button
              key={aba.chave}
              className={`${styles.tab} ${abaAtiva === aba.chave ? styles.tabAtiva : ""}`}
              onClick={() => setAbaAtiva(aba.chave)}
            >
              {aba.rotulo}
            </button>
          ))}
        </div>

        <div className={styles.painel}>
          {carregando && <p className={styles.carregando}>Carregando seus dados...</p>}
          {!carregando && erro && <p className={styles.carregando}>{erro}</p>}

          {!carregando && cliente && (
            <>
              {abaAtiva === "dados" && <MeusDados cliente={cliente} onAtualizar={setCliente} />}

              {abaAtiva === "enderecos" && <Enderecos idCliente={cliente.id} />}

              {abaAtiva === "vendedor" && !verificandoVendedor && (
                <QueroSerVendedor
                  cliente={cliente}
                  souVendedor={souVendedor}
                  onCadastrado={() => setSouVendedor(true)}
                />
              )}

              {abaAtiva === "pagamento" && <MetodosPagamento idCliente={cliente.id} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
