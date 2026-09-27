"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Modal from "../ui/Modal";
import styles from "./PaymentModal.module.css";
import { listarMeusCartoesCredito, listarMeusCartoesDebito, listarMinhasChavesPix, Cartao, ChavePix, TipoPagamento, ApiError } from "@integracao-backend";

interface Props {
  open: boolean;
  total: string;
  onClose: () => void;
  /** Executa o checkout de verdade no back-end e retorna o número do pedido criado. */
  onConfirmar: (metodo: TipoPagamento) => Promise<{ numeroPedido: string }>;
}

type Metodo = TipoPagamento | null;

export default function PaymentModal({ open, total, onClose, onConfirmar }: Props) {
  const [metodo, setMetodo] = useState<Metodo>(null);
  const [cartoesSalvos, setCartoesSalvos] = useState<Cartao[]>([]);
  const [cartaoSelecionado, setCartaoSelecionado] = useState<string>("novo");
  const [chavesPixSalvas, setChavesPixSalvas] = useState<ChavePix[]>([]);
  const [chavePixSelecionada, setChavePixSelecionada] = useState<number | null>(null);
  const [confirmado, setConfirmado] = useState(false);
  const [numeroPedido, setNumeroPedido] = useState("");
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (metodo === "CREDITO") {
      listarMeusCartoesCredito().then(setCartoesSalvos).catch(() => setCartoesSalvos([]));
    } else if (metodo === "DEBITO") {
      listarMeusCartoesDebito().then(setCartoesSalvos).catch(() => setCartoesSalvos([]));
    } else if (metodo === "PIX") {
      listarMinhasChavesPix()
        .then((lista) => {
          setChavesPixSalvas(lista);
          const padrao = lista.find((c) => c.padrao) ?? lista[0];
          if (padrao) setChavePixSelecionada(padrao.id);
        })
        .catch(() => setChavesPixSalvas([]));
    }
  }, [metodo]);

  function resetar() {
    setMetodo(null);
    setConfirmado(false);
    setCartaoSelecionado("novo");
    setChavePixSelecionada(null);
    setErro("");
  }

  function fechar() {
    resetar();
    onClose();
  }

  async function confirmarPagamento() {
    if (!metodo || processando) return;

    setErro("");
    setProcessando(true);

    try {
      const resultado = await onConfirmar(metodo);
      setNumeroPedido(resultado.numeroPedido);
      setConfirmado(true);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : "Não foi possível concluir o pagamento. Tente novamente.");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <Modal open={open} title="Finalizar Compra" onClose={fechar}>
      {confirmado ? (
        <div className={styles.sucesso}>
          <div className={styles.sucessoIcon}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="m5 13 4 4 10-10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3>Pedido confirmado!</h3>
          <p>
            Seu pedido <strong>{numeroPedido}</strong> foi registrado e já está sendo
            preparado pelo produtor.
          </p>
          <Link href="/historico" className={styles.btnPrimario} onClick={fechar}>
            Acompanhar pedido
          </Link>
          <button className={styles.btnTexto} onClick={fechar}>
            Continuar comprando
          </button>
        </div>
      ) : !metodo ? (
        <>
          <p className={styles.instrucao}>
            Total a pagar: <strong>{total}</strong>
          </p>
          <p className={styles.subInstrucao}>Escolha a forma de pagamento:</p>

          <div className={styles.opcoes}>
            <button className={styles.opcao} onClick={() => setMetodo("PIX")}>
              <span className={styles.opcaoIcon}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="m12 3 3.5 3.5L12 10l-3.5-3.5L12 3Z M12 14l3.5 3.5L12 21l-3.5-3.5L12 14Z M3 12l3.5-3.5L10 12l-3.5 3.5L3 12Z M14 12l3.5-3.5L21 12l-3.5 3.5L14 12Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>PIX</span>
            </button>

            <button className={styles.opcao} onClick={() => setMetodo("DEBITO")}>
              <span className={styles.opcaoIcon}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M3 10h18" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </span>
              <span>Débito</span>
            </button>

            <button className={styles.opcao} onClick={() => setMetodo("CREDITO")}>
              <span className={styles.opcaoIcon}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M3 10h18" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M7 15h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </span>
              <span>Crédito</span>
            </button>
          </div>
        </>
      ) : metodo === "PIX" ? (
        <div className={styles.pix}>
          {chavesPixSalvas.length > 0 && (
            <div className={styles.cartoesSalvos}>
              {chavesPixSalvas.map((chave) => (
                <label className={styles.cartaoOpcao} key={chave.id}>
                  <input
                    type="radio"
                    name="chavePix"
                    checked={chavePixSelecionada === chave.id}
                    onChange={() => setChavePixSelecionada(chave.id)}
                  />
                  <span>
                    {chave.nome} — {chave.tipoChave}: {chave.chave}
                  </span>
                </label>
              ))}
            </div>
          )}

          <div className={styles.qr}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="100" fill="var(--color-cream)" />
              {Array.from({ length: 8 }).map((_, row) =>
                Array.from({ length: 8 }).map((_, col) =>
                  (row + col) % 3 === 0 ? (
                    <rect
                      key={`${row}-${col}`}
                      x={col * 12 + 4}
                      y={row * 12 + 4}
                      width="9"
                      height="9"
                      fill="var(--color-primary-dark)"
                    />
                  ) : null
                )
              )}
            </svg>
          </div>
          <p className={styles.pixTexto}>Escaneie o QR Code com o app do seu banco</p>

          <div className={styles.pixCodigo}>
            <span>00020126580014BR.GOV.BCB.PIX...MESA-DO-CAMPO</span>
          </div>

          {erro && <p className={styles.erro}>{erro}</p>}

          <button className={styles.btnPrimario} onClick={confirmarPagamento} disabled={processando}>
            {processando ? "Confirmando..." : "Já paguei"}
          </button>
          <button className={styles.btnTexto} onClick={() => setMetodo(null)} disabled={processando}>
            Voltar
          </button>
        </div>
      ) : (
        <form
          className={styles.cartaoForm}
          onSubmit={(e) => {
            e.preventDefault();
            confirmarPagamento();
          }}
        >
          {cartoesSalvos.length > 0 && (
            <div className={styles.cartoesSalvos}>
              {cartoesSalvos.map((cartao) => (
                <label className={styles.cartaoOpcao} key={cartao.id}>
                  <input
                    type="radio"
                    name="cartao"
                    checked={cartaoSelecionado === String(cartao.id)}
                    onChange={() => setCartaoSelecionado(String(cartao.id))}
                  />
                  <span>
                    {cartao.nome} — {cartao.bandeira} •••• {cartao.ultimosDigitos}
                  </span>
                </label>
              ))}
              <label className={styles.cartaoOpcao}>
                <input
                  type="radio"
                  name="cartao"
                  checked={cartaoSelecionado === "novo"}
                  onChange={() => setCartaoSelecionado("novo")}
                />
                <span>Usar outro cartão</span>
              </label>
            </div>
          )}

          {cartaoSelecionado === "novo" && (
            <>
              <label className={styles.campo}>
                Número do cartão
                <input type="text" inputMode="numeric" placeholder="0000 0000 0000 0000" required />
              </label>

              <label className={styles.campo}>
                Nome impresso no cartão
                <input type="text" placeholder="Como está no cartão" required />
              </label>

              <div className={styles.linhaDupla}>
                <label className={styles.campo}>
                  Validade
                  <input type="text" placeholder="MM/AA" required />
                </label>

                <label className={styles.campo}>
                  CVV
                  <input type="text" inputMode="numeric" placeholder="123" required />
                </label>
              </div>
            </>
          )}

          {erro && <p className={styles.erro}>{erro}</p>}

          <button type="submit" className={styles.btnPrimario} disabled={processando}>
            {processando ? "Processando..." : `Pagar ${total}`}
          </button>
          <button type="button" className={styles.btnTexto} onClick={() => setMetodo(null)} disabled={processando}>
            Voltar
          </button>
        </form>
      )}
    </Modal>
  );
}
