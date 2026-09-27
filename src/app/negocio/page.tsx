"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import MeusProdutos from "../../components/negocio/MeusProdutos";
import ProdutosVendidos from "../../components/negocio/PedidosRecebidos";
import RelatorioVendas from "../../components/negocio/RelatorioVendas";
import Lucro from "../../components/negocio/Lucro";
import { getVendedorAutenticado, ApiError } from "@integracao-backend";
import { useClienteAutenticado } from "../../hooks/useClienteAutenticado";

export default function MeuNegocio() {
  const router = useRouter();
  const { cliente, carregando: carregandoCliente } = useClienteAutenticado();
  const [carregado, setCarregado] = useState(false);
  const [idVendedor, setIdVendedor] = useState<number | null>(null);

  useEffect(() => {
    if (carregandoCliente) return;

    if (!cliente) {
      router.replace("/perfil?tab=vendedor");
      setCarregado(true);
      return;
    }

    getVendedorAutenticado(cliente.id)
      .then((vendedor) => setIdVendedor(vendedor.idVendedor))
      .catch((err) => {
        if (!(err instanceof ApiError && err.status === 404)) {
          console.error(err);
        }
        router.replace("/perfil?tab=vendedor");
      })
      .finally(() => setCarregado(true));
  }, [cliente, carregandoCliente, router]);

  if (!carregado || idVendedor == null) {
    return (
      <div className={styles.bloqueio}>
        <div className={styles.bloqueioCard}>
          <img src="/icon.png" alt="" className={styles.bloqueioIcon} />
          <p className={styles.redirecionando}>
            {carregado ? "Redirecionando para o cadastro de vendedor..." : ""}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.body}>
      <div className={styles.topo}>
        <h1>Meu Negócio</h1>
        <p className={styles.subtitulo}>Gerencie seus produtos e acompanhe o desempenho das vendas.</p>
        <div className={styles.linha}></div>
      </div>

      <div className={styles.container}>
        <section className={styles.secao}>
          <MeusProdutos idVendedor={idVendedor} />
        </section>

        <section className={styles.secao}>
          <ProdutosVendidos idVendedor={idVendedor} />
        </section>

        <section className={styles.secao}>
          <RelatorioVendas idVendedor={idVendedor} />
        </section>

        <section className={styles.secao}>
          <Lucro idVendedor={idVendedor} />
        </section>
      </div>
    </div>
  );
}
