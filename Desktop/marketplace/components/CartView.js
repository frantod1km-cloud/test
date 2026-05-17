'use client'
import styles from './CartView.module.css'

export default function CartView({ cart, total, onChangeQty, onCheckout }) {
  if (cart.length === 0) return (
    <>
      <h2 className={styles.title}>Tu carrito</h2>
      <div className={styles.empty}>🛍<br /><br />Tu carrito está vacío.<br />¡Agregá productos para continuar!</div>
    </>
  )

  return (
    <>
      <h2 className={styles.title}>Tu carrito</h2>
      {cart.map(i => (
        <div key={i.id} className={styles.item}>
          <div className={styles.emoji}>{i.emoji}</div>
          <div className={styles.info}>
            <div className={styles.name}>{i.name}</div>
            <div className={styles.price}>${(i.price * i.qty).toLocaleString('es-AR')}</div>
          </div>
          <div className={styles.qty}>
            <button className={styles.qtyBtn} onClick={() => onChangeQty(i.id, -1)}>−</button>
            <span className={styles.qtyVal}>{i.qty}</span>
            <button className={styles.qtyBtn} onClick={() => onChangeQty(i.id, 1)}>+</button>
          </div>
        </div>
      ))}
      <div className={styles.total}>
        <span>Total</span>
        <span className={styles.totalAmt}>${total.toLocaleString('es-AR')}</span>
      </div>
      <button className={styles.checkoutBtn} onClick={onCheckout}>Ir al checkout →</button>
    </>
  )
}
