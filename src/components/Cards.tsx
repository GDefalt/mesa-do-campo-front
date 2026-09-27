"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import styles from "../components/Cards.module.css";
import Link from "next/link";
import { useCart } from "../context/CartContext";

interface CardProps {
  id: number;
  imagem: string;
  titulo: string;
  nome: string;
  preco: string;
  precoNumerico: number;
}

export default function Cards({ id, imagem, titulo, nome, preco, precoNumerico }: CardProps) {
  const { adicionarItem } = useCart();
  const [adicionado, setAdicionado] = useState(false);

  function handleAdicionar(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    adicionarItem({ id, nome, imagem, precoUnitario: precoNumerico });
    setAdicionado(true);
    setTimeout(() => setAdicionado(false), 1500);
  }

  return (
    <Link href={`/produto/${id}`} className={styles.cards}>
    <Card sx={{ width: "100%", maxWidth: 300 }} className={styles.cards}>
      <img src={imagem} alt={nome} className={styles.cards_img} />

      <CardContent>
        <Typography variant="h5">{titulo}</Typography>
        <Typography>{nome}</Typography>
        <Typography>{preco}</Typography>

        <button className={styles.btnAdicionar} onClick={handleAdicionar}>
          {adicionado ? "Adicionado ✓" : "Adicionar ao carrinho"}
        </button>
      </CardContent>
    </Card>
    </Link>
  );
}
