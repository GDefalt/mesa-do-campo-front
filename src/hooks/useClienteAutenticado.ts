"use client";

import { useEffect, useState } from "react";
import { getClienteAutenticado, ClienteDTO, ApiError } from "@integracao-backend";
import { estaAutenticado } from "@integracao-backend";

interface UseClienteAutenticadoResult {
  cliente: ClienteDTO | null;
  carregando: boolean;
  erro: string;
}

/** GET /api/cliente/auto — usado por qualquer tela que precise saber "quem sou eu". */
export function useClienteAutenticado(): UseClienteAutenticadoResult {
  const [cliente, setCliente] = useState<ClienteDTO | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!estaAutenticado()) {
      setCarregando(false);
      return;
    }

    let cancelado = false;

    getClienteAutenticado()
      .then((dados) => {
        if (!cancelado) setCliente(dados);
      })
      .catch((err) => {
        if (!cancelado) {
          setErro(err instanceof ApiError ? err.message : "Não foi possível carregar seus dados.");
        }
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return { cliente, carregando, erro };
}
