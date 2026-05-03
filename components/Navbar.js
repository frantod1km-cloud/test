'use client'
import { useState } from 'react'
import styles from './Navbar.module.css'

const MENUS = ['Categorías', 'Ofertas', 'Cupones', 'Historial', 'Supermercado', 'Moda', 'Vender', 'Ayuda']

export default function Navbar({ cartCount, onCartClick }) {
  const [q, setQ] = useState('')

  return (
    <>
      {/* BARRA PRINCIPAL */}
      <nav className={styles.nav}>
        {/* LOGO */}
        <div className={styles.logo}>
          <div className={styles.logoBox}>
            <span className={styles.logoTop}>Mercado</span>
            <span className={styles.logoChucu}>Chucu</span>
          </div>
        </div>

        {/* BUSCADOR */}
        <div className={styles.searchWrap}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar productos, marcas y más..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <button className={styles.searchBtn} aria-label="Buscar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>

        {/* DERECHA */}
        <div className={styles.navRight}>
          <a href="/admin/login" className={styles.navLink}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span>Mi cuenta</span>
          </a>
          <button className={styles.cartBtn} onClick={onCartClick}>
            <div className={styles.cartIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </div>
          </button>
        </div>
      </nav>

      {/* BARRA DE MENÚS */}
      <div className={styles.menuBar}>
        <div className={styles.menuInner}>
          {MENUS.map(m => (
            <a key={m} href="#" className={styles.menuItem}>{m}</a>
          ))}
        </div>
      </div>
    </>
  )
}
