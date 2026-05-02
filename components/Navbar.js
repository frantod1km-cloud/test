'use client'
import styles from './Navbar.module.css'

export default function Navbar({ cartCount, onCartClick }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>mer<span>ca</span>do</div>
      <button className={styles.cartBtn} onClick={onCartClick}>
        🛍 Carrito
        <span className={styles.count}>{cartCount}</span>
      </button>
    </nav>
  )
}
