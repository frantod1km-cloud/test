'use client'
import styles from './ProductGrid.module.css'

export default function ProductGrid({ products, onAdd }) {
  return (
    <div className={styles.grid}>
      {products.map(p => (
        <div key={p.id} className={`${styles.card} ${p.stock === 0 ? styles.out : ''}`}>
          <div className={styles.cardImg}>{p.emoji}</div>
          <div className={styles.cardBody}>
            <div className={styles.cat}>{p.category}</div>
            <div className={styles.name}>{p.name}</div>
            <div className={styles.desc}>{p.desc}</div>
            <div className={styles.footer}>
              <div>
                <div className={styles.price}>${p.price.toLocaleString('es-AR')}</div>
                <div className={styles.stock}>
                  {p.stock === 0 ? 'Sin stock' : `${p.stock} disponibles`}
                </div>
              </div>
              <button
                className={styles.addBtn}
                onClick={() => onAdd(p)}
                disabled={p.stock === 0}
                aria-label={`Agregar ${p.name}`}
              >
                +
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
