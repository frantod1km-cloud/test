'use client'
import styles from './ProductGrid.module.css'

export default function ProductGrid({ products, onAdd }) {
  if (products.length === 0) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>
      No hay productos en esta categoría todavía.
    </div>
  )
  return (
    <div className={styles.grid}>
      {products.map(p => (
        <div key={p.id} className={`${styles.card} ${p.stock === 0 ? styles.out : ''}`}>
          <div className={styles.cardImg}>
            {p.imagen_url
              ? <img src={p.imagen_url} alt={p.nombre} className={styles.img} />
              : <span className={styles.emoji}>📦</span>
            }
          </div>
          <div className={styles.cardBody}>
            <div className={styles.name}>{p.nombre}</div>
            {p.cuotas > 1 && (
              <div className={styles.installments}>
                en {p.cuotas} cuotas sin interés de ${Math.round(p.precio / p.cuotas).toLocaleString('es-AR')}
              </div>
            )}
            <div className={styles.price}>${Number(p.precio).toLocaleString('es-AR')}</div>
            {p.envio_gratis && <div className={styles.freeShip}>🚚 Envío gratis</div>}
            <div className={styles.stock}>
              {p.stock === 0 ? 'Sin stock' : `${p.stock} disponibles`}
            </div>
            <button className={styles.addBtn} onClick={() => onAdd(p)} disabled={p.stock === 0}>
              Agregar al carrito
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
