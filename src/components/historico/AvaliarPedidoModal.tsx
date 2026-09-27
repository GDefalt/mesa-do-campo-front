"use client";

import { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import StarRating from "./StarRating";
import styles from "./AvaliarPedidoModal.module.css";
import { usePedidoDetalhado } from "../../hooks/usePedidoDetalhado";
import { criarAvaliacao, listarVendedores, VendedorDTO, ApiError } from "@integracao-backend";

interface Props {
  pedidoId: number | null;
  idClienteAutenticado: number | null;
  onClose: () => void;
}

interface RascunhoAvaliacao {
  nota: number;
  descricao: string;
}

export default function AvaliarPedidoModal({ pedidoId, idClienteAutenticado, onClose }: Props) {
  const { detalhe, produtos, carregando, erro } = usePedidoDetalhado(pedidoId);

  const [vendedores, setVendedores] = useState<VendedorDTO[]>([]);
  const [rascunho, setRascunho] = useState<Record<number, RascunhoAvaliacao>>({});
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState("");
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    if (pedidoId != null) {
      listarVendedores().then(setVendedores).catch(() => setVendedores([]));
    }
  }, [pedidoId]);

  // Avaliação no back-end é por VENDEDOR, não por produto — então agrupamos
  // os itens do pedido pelos vendedores distintos envolvidos.
  const idsVendedores = useMemo(() => {
    if (!detalhe) return [];
    const idsProdutos = detalhe.itens.map((i) => i.idProduto);
    const idsUnicos = new Set<number>();
    idsProdutos.forEach((idProduto) => {
      const produto = produtos[idProduto];
      if (produto) idsUnicos.add(produto.idVendedor);
    });
    return Array.from(idsUnicos);
  }, [detalhe, produtos]);

  if (pedidoId == null) return null;

  function nomeDoVendedor(idVendedor: number) {
    return vendedores.find((v) => v.idVendedor === idVendedor)?.nome ?? `Vendedor #${idVendedor}`;
  }

  function definirNota(idVendedor: number, nota: number) {
    setRascunho((atual) => ({
      ...atual,
      [idVendedor]: { nota, descricao: atual[idVendedor]?.descricao ?? "" },
    }));
  }

  function definirDescricao(idVendedor: number, descricao: string) {
    setRascunho((atual) => ({
      ...atual,
      [idVendedor]: { nota: atual[idVendedor]?.nota ?? 0, descricao },
    }));
  }

  function handleFechar() {
    setRascunho({});
    setEnviado(false);
    setErroEnvio("");
    onClose();
  }

  async function handleEnviar() {
    if (!idClienteAutenticado) {
      setErroEnvio("Não foi possível identificar seu usuário. Tente atualizar a página.");
      return;
    }

    const avaliacoesParaEnviar = Object.entries(rascunho).filter(([, v]) => v.nota > 0);
    if (avaliacoesParaEnviar.length === 0) return;

    setEnviando(true);
    setErroEnvio("");

    try {
      await Promise.all(
        avaliacoesParaEnviar.map(([idVendedor, dados]) =>
          criarAvaliacao({
            idVendedor: Number(idVendedor),
            idCliente: idClienteAutenticado,
            nota: dados.nota,
            descricao: dados.descricao || undefined,
          })
        )
      );
      setEnviado(true);
    } catch (err) {
      setErroEnvio(err instanceof ApiError ? err.message : "Não foi possível enviar sua avaliação.");
    } finally {
      setEnviando(false);
    }
  }

  const algumaNotaPreenchida = Object.values(rascunho).some((v) => v.nota > 0);

  return (
    <Modal open={pedidoId != null} title={`Avaliar pedido #${pedidoId}`} onClose={handleFechar}>
      {enviado ? (
        <div className={styles.confirmacao}>
          <div className={styles.confirmacaoIcon}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="m5 13 4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3>Avaliação enviada!</h3>
          <p>Obrigado pelo feedback — ele ajuda outros consumidores e o produtor.</p>
          <button className={styles.btnFechar} onClick={handleFechar}>
            Fechar
          </button>
        </div>
      ) : carregando ? (
        <p className={styles.instrucao}>Carregando...</p>
      ) : erro ? (
        <p className={styles.instrucao}>{erro}</p>
      ) : idsVendedores.length === 0 ? (
        <p className={styles.instrucao}>Não foi possível identificar o(s) vendedor(es) deste pedido.</p>
      ) : (
        <>
          <p className={styles.instrucao}>Dê uma nota para cada vendedor deste pedido.</p>

          <div className={styles.lista}>
            {idsVendedores.map((idVendedor) => (
              <div className={styles.item} key={idVendedor}>
                <div className={styles.itemConteudo}>
                  <span className={styles.itemNome}>{nomeDoVendedor(idVendedor)}</span>
                  <StarRating
                    value={rascunho[idVendedor]?.nota ?? 0}
                    onChange={(nota) => definirNota(idVendedor, nota)}
                  />
                  <textarea
                    placeholder="Conte como foi sua experiência (opcional)"
                    rows={2}
                    value={rascunho[idVendedor]?.descricao ?? ""}
                    onChange={(e) => definirDescricao(idVendedor, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {erroEnvio && <p className={styles.instrucao}>{erroEnvio}</p>}

          <button
            className={styles.btnEnviar}
            disabled={!algumaNotaPreenchida || enviando}
            onClick={handleEnviar}
          >
            {enviando ? "Enviando..." : "Enviar avaliação"}
          </button>
        </>
      )}
    </Modal>
  );
}
