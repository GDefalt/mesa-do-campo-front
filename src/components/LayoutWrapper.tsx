"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import styles from "./LayoutWrapper.module.css";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideLayout = pathname === "/login" || pathname === "/register";

  return (
    <CartProvider>
      <div className={styles.wrapper}>
        {!hideLayout && <Navbar />}
        <div className={styles.conteudo}>{children}</div>
        {!hideLayout && <Footer />}
      </div>
    </CartProvider>
  );
}