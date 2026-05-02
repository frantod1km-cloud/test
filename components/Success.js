'use client'
import styles from './Success.module.css'

export default function Success({ orderId, onClose }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>✅</div>
      <h2 className={styles.title}>¡Pedido recibido!</h2>
      <p className={styles.text}>
        Recibimos tu pedido y nuestro equipo lo procesará en las próximas horas.
      </p>
      <div className={styles.orderId}>{orderId}</div>
      <p className={styles.sub}>
        Te enviaremos la confirmación por email con los detalles y el seguimiento del envío.
      </p>
      <button className={styles.btn} onClick={onClose}>Seguir comprando</button>
    </div>
  )
}
