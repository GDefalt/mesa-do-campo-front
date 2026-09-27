import styles from "./ValueProps.module.css";

const items = [
  {
    title: "Direto do produtor",
    description: "Sem atravessadores, aproximando quem planta de quem consome.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 21c-4-2.5-7-6-7-10a7 7 0 0 1 14 0c0 4-3 7.5-7 10Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path d="M12 15V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M12 11c0-2 1.5-3 3.5-3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Transparência total",
    description: "Origem, prazos e condições visíveis em cada etapa da compra.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 3 4 6v5c0 4.5 3 7.8 8 10 5-2.2 8-5.5 8-10V6l-8-3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="m8.5 12.5 2.4 2.4L15.5 9.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Entrega acompanhada",
    description: "Rastreio do pedido do preparo até a chegada na sua casa.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 7h11v8H3z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M14 10h4l3 3v2h-7z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="17" r="1.6" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.5" cy="17" r="1.6" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    title: "Preço justo",
    description: "Menos intermediários, mais valor para quem produz e compra.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 12.5 12.5 20a1.5 1.5 0 0 1-2.1 0l-6.4-6.4a1.5 1.5 0 0 1 0-2.1L11.5 4H18a2 2 0 0 1 2 2v6.5Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="15.5" cy="8.5" r="1.4" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
];

export default function ValueProps() {
  return (
    <section className={styles.wrapper}>
      {items.map((item) => (
        <div className={styles.card} key={item.title}>
          <div className={styles.iconWrap}>{item.icon}</div>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>
      ))}
    </section>
  );
}
