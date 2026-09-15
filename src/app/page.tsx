import styles from "../app/page.module.css";
import CardCarrossel from '../components/CardCarrossel'
import CardCarrosselDestaque from '../components/CardCarrosselDestaque'
import Hero from "../components/home/Hero";
import ValueProps from "../components/home/ValueProps";
import Categorias from "../components/home/Categorias";
import HowItWorks from "../components/home/HowItWorks";
import ProducerCta from "../components/home/ProducerCta";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>

        <Hero />

        <ValueProps />

        <div className={styles.main_carrossel}>
          <div className={styles.destaque_background}>
            <h2 className={styles.destaque}>Produtos em Destaque</h2>
          </div>
          <div className={styles.itens_carrossel}>
            <CardCarrosselDestaque />
          </div>
        </div>

        <Categorias />

        <div id="produtos" className={styles.main_carrossel}>
          <div className={styles.destaque_background}>
            <h2 className={styles.destaque}>Produtos</h2>
          </div>
          <div className={styles.itens_cards}>
            <CardCarrossel />
          </div>
        </div>

        <HowItWorks />

        <ProducerCta />

      </main>
    </div>
  );
}
