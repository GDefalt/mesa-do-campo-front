"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import MeusProdutos from "../../components/negocio/MeusProdutos";
import ProdutosVendidos from "../../components/negocio/PedidosRecebidos";
import RelatorioVendas from "../../components/negocio/RelatorioVendas";
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
        <span className={styles.sobreTitulo}>PAINEL DO VENDEDOR</span>
        <h1>Meu Negócio</h1>
        <p className={styles.subtitulo}>Organize seu catálogo, acompanhe os pedidos e tome decisões com os dados das suas vendas.</p>
      </div>

      <div className={styles.container}>
        <section className={`${styles.secao} ${styles.secaoProdutos}`}>
          <MeusProdutos idVendedor={idVendedor} />
        </section>

        <section className={`${styles.secao} ${styles.secaoPedidos}`}>
          <ProdutosVendidos idVendedor={idVendedor} />
        </section>

        <section className={`${styles.secao} ${styles.secaoRelatorio}`}>
          <RelatorioVendas idVendedor={idVendedor} />
        </section>
      </div>
    </div>
  );
}
