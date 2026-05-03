'use client'
import { useState } from 'react'
import styles from './Navbar.module.css'

const MENUS = ['Categorías', 'Ofertas', 'Cupones', 'Supermercado', 'Moda', 'Vender', 'Ayuda']

export default function Navbar({ cartCount, onCartClick }) {
  const [q, setQ] = useState('')

  return (
    <div className={styles.navWrap}>
      <div className={styles.topRow}>

        {/* LOGO + Enviar a (sin ícono pin) */}
        <div className={styles.logoCol}>
          <div className={styles.logo}>
            <div className={styles.logoIconWrap}>
              <svg viewBox="0 0 48 48" className={styles.logoSvg} xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="23" fill="#fff" stroke="#e0e0e0" strokeWidth="1"/>
                <text x="24" y="30" textAnchor="middle" fontSize="22">🤝</text>
              </svg>
            </div>
            <div className={styles.logoText}>
              <span className={styles.logoTop}>mercado</span>
              <span className={styles.logoChucu}>Chucu</span>
            </div>
          </div>
          <div className={styles.enviarA}>
            <div>
              <div className={styles.enviarLabel}>Enviar a</div>
              <div className={styles.enviarCity}>Buenos Aires 1629</div>
            </div>
          </div>
        </div>

        {/* BUSCADOR + MENÚ debajo */}
        <div className={styles.searchCol}>
          <div className={styles.searchWrap}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Buscar productos, marcas y más..."
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <button className={styles.searchBtn} aria-label="Buscar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>
          <div className={styles.bottomRow}>
            <div className={styles.menuRow}>
              {MENUS.map(m => (
                <a key={m} href="#" className={styles.menuItem}>{m}</a>
              ))}
            </div>
          </div>
        </div>

        {/* PROMO + CUENTA */}
        <div className={styles.rightCol}>
          <div className={styles.promoAndAccount}>
            <div className={styles.promoBox}>
              Suscribite a <span className={styles.promoTag}>Chucu+</span>
            </div>
            <div className={styles.accountRow}>
              <a href="/admin/login" className={styles.accountBtn}>
                <div className={styles.avatar}>MC</div>
                <span>Mi cuenta</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <a href="#" className={styles.iconLink}>Mis compras</a>
              <a href="#" className={styles.iconLink}>
                Favoritos
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
              <button className={styles.iconBtn}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </button>
              <button className={styles.iconBtn} onClick={onCartClick}>
                <div className={styles.cartIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
