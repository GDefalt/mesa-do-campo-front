import styles from "./Categorias.module.css";

const categorias = [
  "Frutas",
  "Verduras e Legumes",
  "Grãos e Cereais",
  "Laticínios",
  "Ovos",
  "Orgânicos",
];

export default function Categorias() {
  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Explore por categoria</h2>
      <div className={styles.chips}>
        {categorias.map((categoria) => (
          <span className={styles.chip} key={categoria}>
            {categoria}
          </span>
        ))}
      </div>
    </section>
  );
}
