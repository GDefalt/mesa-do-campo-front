"use client";

import { useState } from "react";
import styles from "./Faq.module.css";

const perguntas = [
  {
    pergunta: "Como acompanho o status do meu pedido?",
    resposta:
      "Acesse \"Devoluções e Pedidos\" no menu superior. Lá você encontra o status atual e as etapas de entrega de cada compra.",
  },
  {
    pergunta: "Quais formas de pagamento são aceitas?",
    resposta:
      "Aceitamos dinheiro, cartão de crédito, cartão de débito e PIX no momento da finalização da compra.",
  },
  {
    pergunta: "Posso cancelar um pedido depois de finalizar a compra?",
    resposta:
      "Sim, desde que o pedido ainda não tenha sido marcado como \"Enviado\". O cancelamento pode ser feito na tela de pedidos.",
  },
  {
    pergunta: "Como me cadastro como produtor rural?",
    resposta:
      "Na tela de cadastro, escolha a opção de conta para vendedor e informe os dados da sua propriedade. A conta fica pendente até aprovação.",
  },
  {
    pergunta: "Meus dados estão seguros na plataforma?",
    resposta:
      "Sim. Suas informações são armazenadas com criptografia e não são compartilhadas com terceiros sem autorização.",
  },
];

export default function Faq() {
  const [aberta, setAberta] = useState<number | null>(0);

  function alternar(index: number) {
    setAberta(aberta === index ? null : index);
  }

  return (
    <div className={styles.faq}>
      {perguntas.map((item, index) => (
        <div className={styles.item} key={item.pergunta}>
          <button
            className={styles.pergunta}
            onClick={() => alternar(index)}
            aria-expanded={aberta === index}
          >
            <span>{item.pergunta}</span>
            <span className={`${styles.chevron} ${aberta === index ? styles.chevronAberto : ""}`}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="m6 9 6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>

          {aberta === index && <p className={styles.resposta}>{item.resposta}</p>}
        </div>
      ))}
    </div>
  );
}
