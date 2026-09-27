import styles from "./HowItWorks.module.css";

const steps = [
  {
    number: "01",
    title: "Escolha produtos frescos",
    description:
      "Navegue pelo catálogo e encontre itens direto de pequenos produtores da sua região.",
  },
  {
    number: "02",
    title: "Compre com segurança",
    description:
      "Adicione ao carrinho e finalize o pagamento em dinheiro, cartão ou PIX.",
  },
  {
    number: "03",
    title: "Acompanhe a entrega",
    description:
      "Receba atualizações do pedido até ele chegar fresquinho na sua casa.",
  },
];

export default function HowItWorks() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h2>Como funciona</h2>
        <p>Da colheita até a sua porta, em três passos simples.</p>
      </div>

      <div className={styles.steps}>
        {steps.map((step) => (
          <div className={styles.step} key={step.number}>
            <span className={styles.number}>{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
