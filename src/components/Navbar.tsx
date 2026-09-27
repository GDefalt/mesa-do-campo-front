"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import styles from "../components/Navbar.module.css";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { estaAutenticado, limparCredenciais } from "@integracao-backend";

export default function Navbar() {

  const [open, setOpen] = useState(false);
  const [autenticado, setAutenticado] = useState(false);
  const { quantidadeTotal } = useCart();
  const router = useRouter();

  useEffect(() => {
    setAutenticado(estaAutenticado());
  }, []);

  function toggleMenu(){
    setOpen(!open);
  }

  function handleSair() {
    limparCredenciais();
    setAutenticado(false);
    setOpen(false);
    router.push("/login");
  }

  return (
    <div className={styles.navbar}>

      <img src="/icon.png" alt="Logo" className={styles.icon} />

      <div className={styles.links}>
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/catalogo">Catálogo</Link></li>
          <li><Link href="/historico">Pedidos</Link></li>
          <li><Link href="/suporte">Suporte</Link></li>
        </ul>
      </div>

      <div className={styles.dropbar}>

        <div className={styles.perfil}>
          <Link href="/carrinho" className={styles.carrinho_icon}>
            <img src="/carrinho.svg" alt="Carrinho"/>
            {quantidadeTotal > 0 && (
              <span className={styles.carrinhoBadge}>{quantidadeTotal}</span>
            )}
          </Link>
        </div>

        <div className={styles.profile_icons}>

          <Button onClick={toggleMenu} disableRipple disableFocusRipple>

            <img
              src={open ? "/profile_minus.svg" : "/profile_plus.svg"}
              alt="Perfil"
              className={styles.profile_icon}
            />

          </Button>

          {open && (
            <div className={styles.dropdown}>
              {autenticado ? (
                <>
                  <Link href="/perfil" onClick={() => setOpen(false)}>Perfil</Link>
                  <Link href="/negocio" onClick={() => setOpen(false)}>Meu Negócio</Link>
                  <button onClick={handleSair} className={styles.dropdownBtn}>Sair</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
                  <Link href="/register" onClick={() => setOpen(false)}>Cadastre-se</Link>
                </>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}