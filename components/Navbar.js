'use client'
import styles from './Navbar.module.css'

export default function Navbar({ cartCount, onCartClick }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>🛍</span>
        mi mercado
      </div>
      <div className={styles.searchWrap}>
        <input className={styles.searchInput} type="text" placeholder="Buscar productos, marcas y más..." />
        <button className={styles.searchBtn}>🔍</button>
      </div>
      <button className={styles.cartBtn} onClick={onCartClick}>
        🛒 Carrito
        <span className={styles.count}>{cartCount}</span>
      </button>
    </nav>
  )
}
