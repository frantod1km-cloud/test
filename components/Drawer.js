'use client'
import styles from './Drawer.module.css'

export default function Drawer({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className={styles.drawerBody}>{children}</div>
      </div>
    </div>
  )
}
