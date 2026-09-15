"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import MeusProdutos from "../../components/negocio/MeusProdutos";
import PedidosRecebidos from "../../components/negocio/PedidosRecebidos";
import RelatorioVendas from "../../components/negocio/RelatorioVendas";
import Lucro from "../../components/negocio/Lucro";
import { getVendedorAutenticado, ApiError } from "@integracao-backend";

export default function MeuNegocio() {
  const router = useRouter();
  const [carregado, setCarregado] = useState(false);
  const [idVendedor, setIdVendedor] = useState<number | null>(null);

  useEffect(() => {
    getVendedorAutenticado()
      .then((vendedor) => setIdVendedor(vendedor.idVendedor))
      .catch((err) => {
        if (!(err instanceof ApiError && err.status === 404)) {
          console.error(err);
        }
        router.replace("/perfil?tab=vendedor");
      })
      .finally(() => setCarregado(true));
  }, [router]);

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
          <PedidosRecebidos idVendedor={idVendedor} />
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
