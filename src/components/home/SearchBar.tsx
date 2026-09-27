"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./SearchBar.module.css";

export default function SearchBar() {
  const [termo, setTermo] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!termo.trim()) return;
    router.push(`/catalogo?q=${encodeURIComponent(termo.trim())}`);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.icon}>
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
        <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>

      <input
        type="text"
        placeholder="Buscar por frutas, verduras, laticínios..."
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
      />

      <button type="submit">Buscar</button>
    </form>
  );
}
