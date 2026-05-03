'use client'
import styles from './CartView.module.css'

export default function CartView({ cart, total, onChangeQty, onCheckout }) {
  const envio = total >= 20000 ? 0 : 1500
  const final = total + envio

  if (cart.length === 0) return (
    <div className={styles.empty}>
      <div className={styles.emptyIcon}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      </div>
      <p className={styles.emptyText}>Tu carrito está vacío</p>
      <p className={styles.emptySubtext}>Agregá productos para continuar</p>
    </div>
  )

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Tu carrito ({cart.reduce((s,i)=>s+i.qty,0)} productos)</h2>

      <div className={styles.items}>
        {cart.map(i => (
          <div key={i.id} className={styles.item}>
            <div className={styles.imgBox}>
              {i.imagen_url
                ? <img src={i.imagen_url} alt={i.nombre} className={styles.img} />
                : <span className={styles.emoji}>📦</span>
              }
            </div>
            <div className={styles.info}>
              <div className={styles.name}>{i.nombre}</div>
              {i.envio_gratis && <div className={styles.ship}>🚚 Envío gratis</div>}
              <div className={styles.unitPrice}>${Number(i.precio).toLocaleString('es-AR')} c/u</div>
              <div className={styles.qtyRow}>
                <div className={styles.qty}>
                  <button className={styles.qtyBtn} onClick={() => onChangeQty(i.id, -1)}>−</button>
                  <span className={styles.qtyVal}>{i.qty}</span>
                  <button className={styles.qtyBtn} onClick={() => onChangeQty(i.id, 1)}>+</button>
                </div>
                <div className={styles.subtotal}>${(i.precio * i.qty).toLocaleString('es-AR')}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        <div className={styles.sumRow}>
          <span>Subtotal</span>
          <span>${total.toLocaleString('es-AR')}</span>
        </div>
        <div className={styles.sumRow}>
          <span>Envío</span>
          <span className={envio === 0 ? styles.free : ''}>{envio === 0 ? '🚚 Gratis' : `$${envio.toLocaleString('es-AR')}`}</span>
        </div>
        <div className={styles.sumTotal}>
          <span>Total</span>
          <span>${final.toLocaleString('es-AR')}</span>
        </div>
      </div>

      <button className={styles.checkoutBtn} onClick={onCheckout}>
        Continuar compra
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft:6}}>
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  )
}
