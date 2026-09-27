import Link from "next/link";
import SearchBar from "./SearchBar";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <span className={styles.eyebrow}>Direto do produtor rural</span>

        <h1 className={styles.title}>
          Do campo para a sua mesa,
          <br />
          sem intermediários.
        </h1>

        <p className={styles.subtitle}>
          A Mesa do Campo conecta pequenos produtores rurais e comerciantes
          locais a consumidores, com transparência em todo o processo e
          entrega acompanhada de perto do início ao fim.
        </p>

        <SearchBar />

        <div className={styles.actions}>
          <Link href="#produtos" className={styles.primaryBtn}>
            Ver produtos
          </Link>
          <Link href="/negocio" className={styles.secondaryBtn}>
            Quero vender meus produtos
          </Link>
        </div>
      </div>

      <div className={styles.imageWrapper}>
        <img
          src="/ruralp3.jpg"
          alt="Produtor rural segurando uma caixa de hortaliças frescas"
          className={styles.image}
        />
        <div className={styles.badge}>
          <img src="/icon.png" alt="" className={styles.badgeIcon} />
          <div>
            <strong>Produção regional</strong>
            <span>Direto de quem planta</span>
          </div>
        </div>
      </div>
    </section>
  );
}
