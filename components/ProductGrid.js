'use client'
import styles from './ProductGrid.module.css'

export default function ProductGrid({ products, onAdd }) {
  return (
    <div className={styles.grid}>
      {products.map(p => (
        <div key={p.id} className={`${styles.card} ${p.stock === 0 ? styles.out : ''}`}>
          <div className={styles.cardImg}>{p.emoji}</div>
          <div className={styles.cardBody}>
            <div className={styles.name}>{p.name}</div>
            <div className={styles.installments}>en 12 cuotas sin interés</div>
            <div className={styles.price}>${p.price.toLocaleString('es-AR')}</div>
            {p.price >= 20000 && <div className={styles.freeShip}>Envío gratis</div>}
            <div className={styles.stock}>
              {p.stock === 0 ? 'Sin stock' : `${p.stock} disponibles`}
            </div>
            <button
              className={styles.addBtn}
              onClick={() => onAdd(p)}
              disabled={p.stock === 0}
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
