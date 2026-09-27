"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import styles from "../components/Carrossel.module.css";

import { Navigation } from "swiper/modules";
import Link from "next/link";

export default function Carousel() {
  return (
    <Swiper
      modules={[Navigation]}
      spaceBetween={20}
      slidesPerView={4}
      navigation
      breakpoints={{
      320: { slidesPerView: 1 },
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
      1400: { slidesPerView: 5 }
    }}
      className={styles.carrossel}
    >
      <SwiperSlide>
        <Link href="/produto" className={styles.cards}>
          <h1>Produto</h1>
          <img src="/rural2.jpg" alt="" />
          <p>Cebola Legal</p>
          <p>R$ 99,00</p>
        </Link>
      </SwiperSlide>

      <SwiperSlide>
        <Link href="/produto" className={styles.cards}>
          <h1>Produto</h1>
          <img src="/ruralp1.jpg" alt="" />
          <p>Cebola Legal</p>
          <p>R$ 99,00</p>
        </Link>
      </SwiperSlide>

      <SwiperSlide>
        <Link href="/produto" className={styles.cards}>
          <h1>Produto</h1>
          <img src="/ruralp3.jpg" alt="" />
          <p>Cebola Legal</p>
          <p>R$ 99,00</p>
        </Link>
      </SwiperSlide>

      <SwiperSlide>
       <Link href="/produto" className={styles.cards}>
          <h1>Produto</h1>
          <img src="/ruralp3.jpg" alt="" />
          <p>Cebola Legal</p>
          <p>R$ 99,00</p>
        </Link>
      </SwiperSlide>

      <SwiperSlide>
        <Link href="/produto" className={styles.cards}>
          <h1>Produto</h1>
          <img src="/ruralp3.jpg" alt="" />
          <p>Cebola Legal</p>
          <p>R$ 99,00</p>
        </Link>
      </SwiperSlide>
    </Swiper>
  );
}