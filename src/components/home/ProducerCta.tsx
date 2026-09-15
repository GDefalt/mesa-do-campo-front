import Link from "next/link";
import styles from "./ProducerCta.module.css";

export default function ProducerCta() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.text}>
        <h2>É produtor rural ou comerciante local?</h2>
        <p>
          Cadastre sua propriedade, publique seus produtos e venda direto
          para consumidores da sua região, sem intermediários.
        </p>
      </div>
      <Link href="/negocio" className={styles.button}>
        Cadastrar como vendedor
      </Link>
    </section>
  );
}
