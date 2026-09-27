"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import styles from '../components/CardCarrosselDestaque.module.css'

import Cards from "./Cards";
import { useTodosProdutos } from "../hooks/useTodosProdutos";
import { imagemDoProduto } from "../lib/produtoImagem";
import { formatarPreco } from "../lib/formatarPreco";
import { CATEGORIA_PRODUTO_LABEL } from "@integracao-backend";

export default function CardCarrosselDestaque() {
  const { produtos, carregando, erro } = useTodosProdutos();
  const destaques = produtos.slice(0, 5);

  if (carregando) return <p className={styles.mensagem}>Carregando destaques...</p>;
  if (erro) return <p className={styles.mensagem}>{erro}</p>;
  if (destaques.length === 0) return <p className={styles.mensagem}>Nenhum produto em destaque no momento.</p>;

  return (
    <Swiper
     modules={[Navigation]}
    spaceBetween={20}
    navigation
    breakpoints={{
      320: { slidesPerView: 1 },
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 2 },
      1400: { slidesPerView: 3 }
    }}
    className={styles.carrossel_cards}
    >

      {destaques.map((produto) => (
        <SwiperSlide key={produto.id}>
          <Cards
            id={produto.id}
            imagem={imagemDoProduto(produto.categoria)}
            titulo={CATEGORIA_PRODUTO_LABEL[produto.categoria]}
            nome={produto.nome}
            preco={formatarPreco(produto.preco)}
            precoNumerico={produto.preco}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
