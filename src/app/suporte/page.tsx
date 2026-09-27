import styles from "./page.module.css";
import Faq from "../../components/suporte/Faq";

const canais = [
  {
    titulo: "E-mail",
    valor: "suporte@mesadocampo.com.br",
    descricao: "Resposta em até 1 dia útil",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    titulo: "WhatsApp",
    valor: "(14) 99999-0000",
    descricao: "Atendimento rápido por chat",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4 20l1.3-3.8A8 8 0 1 1 8.6 19L4 20Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9 10c0 3 2.5 5.5 5.5 5.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    titulo: "Horário",
    valor: "Seg. a Sex., 8h às 18h",
    descricao: "Fora do horário, deixe seu chamado",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Suporte() {
  return (
    <div className={styles.body}>
      <div className={styles.topo}>
        <h1>Central de Suporte</h1>
        <p className={styles.subtitulo}>
          Tire dúvidas, acompanhe chamados ou fale com a nossa equipe.
        </p>
        <div className={styles.linha}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.canais}>
          {canais.map((canal) => (
            <div className={styles.canal} key={canal.titulo}>
              <div className={styles.canalIcon}>{canal.icon}</div>
              <div>
                <h3>{canal.titulo}</h3>
                <p className={styles.canalValor}>{canal.valor}</p>
                <p className={styles.canalDescricao}>{canal.descricao}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.grid}>
          <div className={styles.coluna}>
            <h2 className={styles.secaoTitulo}>Perguntas frequentes</h2>
            <Faq />
          </div>

          <div className={styles.coluna}>
            <h2 className={styles.secaoTitulo}>Abrir um chamado</h2>

            <form className={styles.formulario}>
              <label className={styles.campo}>
                Assunto
                <input type="text" placeholder="Resuma o seu problema" />
              </label>

              <label className={styles.campo}>
                Categoria
                <select defaultValue="Pedido">
                  <option>Pedido</option>
                  <option>Pagamento</option>
                  <option>Produto</option>
                  <option>Minha conta</option>
                  <option>Outro assunto</option>
                </select>
              </label>

              <label className={styles.campo}>
                Mensagem
                <textarea rows={5} placeholder="Descreva com detalhes o que está acontecendo" />
              </label>

              <label className={styles.campo}>
                Anexo (opcional)
                <input type="file" className={styles.arquivo} />
              </label>

              <button type="button" className={styles.enviar}>
                Enviar chamado
              </button>

              <p className={styles.protocoloAviso}>
                Você receberá um número de protocolo por e-mail para acompanhar o andamento.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
