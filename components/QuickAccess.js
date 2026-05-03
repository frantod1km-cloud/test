'use client'
import styles from './QuickAccess.module.css'

const CARDS = [
  {
    title: 'Envío gratis',
    desc: 'Beneficio por ser tu primera compra.',
    icon: '📦',
    btn: 'Mostrar productos',
    cat: 'Todos',
  },
  {
    title: 'Medios de pago',
    desc: 'Pagá tus compras de forma rápida y segura.',
    icon: '💳',
    btn: 'Conocer medios de pago',
    cat: null,
  },
  {
    title: 'Menos de $20.000',
    desc: 'Descubrí productos con precios bajos.',
    icon: '💰',
    btn: 'Mostrar productos',
    cat: 'Todos',
  },
  {
    title: 'Más vendidos',
    desc: 'Explorá los productos que son tendencia.',
    icon: '🏆',
    btn: 'Ir a Más vendidos',
    cat: 'Todos',
  },
  {
    title: 'Tecnología',
    desc: 'Los mejores gadgets y electrónicos.',
    icon: '💻',
    btn: 'Ver tecnología',
    cat: 'Tecnología',
  },
  {
    title: 'Hogar',
    desc: 'Todo para decorar y equipar tu casa.',
    icon: '🏠',
    btn: 'Ver hogar',
    cat: 'Hogar',
  },
]

const PROMO_BANNERS = [
  {
    tag: 'TECNO OFERTAS',
    title: '¡HASTA 35% OFF Y\n12X SIN INTERÉS!',
    link: 'Ver ofertas',
    bg: '#000',
    color: '#fff',
    emoji: '📱',
  },
  {
    tag: 'RENOVÁ TU COCINA',
    title: 'DISEÑO FUNCIONAL\nY PRÁCTICO',
    link: 'Ver ofertas',
    bg: '#1a237e',
    color: '#fff',
    emoji: '🍳',
  },
]

export default function QuickAccess({ onFilter }) {
  return (
    <div className={styles.wrap}>
      {/* TARJETAS DE ACCESO RÁPIDO */}
      <div className={styles.cards}>
        {CARDS.map((c, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardIcon}>{c.icon}</div>
            <div className={styles.cardTitle}>{c.title}</div>
            <div className={styles.cardDesc}>{c.desc}</div>
            <button
              className={styles.cardBtn}
              onClick={() => c.cat && onFilter(c.cat)}
            >
              {c.btn}
            </button>
          </div>
        ))}
      </div>

      {/* BANNERS PROMO */}
      <div className={styles.promos}>
        {PROMO_BANNERS.map((b, i) => (
          <div key={i} className={styles.promo} style={{ background: b.bg, color: b.color }}>
            <div className={styles.promoText}>
              <div className={styles.promoTag}>{b.tag}</div>
              <div className={styles.promoTitle}>{b.title}</div>
              <div className={styles.promoLink}>{b.link}</div>
            </div>
            <div className={styles.promoEmoji}>{b.emoji}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
