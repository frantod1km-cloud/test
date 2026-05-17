'use client'
import styles from './Drawer.module.css'

export default function Drawer({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.drawer}>
        <div className={styles.handle} />
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  )
}
