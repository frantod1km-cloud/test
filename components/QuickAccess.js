'use client'
import styles from './QuickAccess.module.css'

const CARDS = [
  {
    title: 'Envío gratis',
    desc: 'Beneficio por ser tu primera compra.',
    img: 'https://http2.mlstatic.com/frontend-assets/homes-palermo-statics/1.0.0-beta.29/home/envio-gratis.webp',
    btn: 'Mostrar productos',
    cat: 'Todos',
  },
  {
    title: 'Medios de pago',
    desc: 'Pagá tus compras de forma rápida y segura.',
    img: 'https://http2.mlstatic.com/frontend-assets/homes-palermo-statics/1.0.0-beta.29/home/medios-de-pago.webp',
    btn: 'Conocer medios de pago',
    cat: null,
  },
  {
    title: 'Menos de $20.000',
    desc: 'Descubrí productos con precios bajos.',
    img: 'https://http2.mlstatic.com/frontend-assets/homes-palermo-statics/1.0.0-beta.29/home/menos-de-20000.webp',
    btn: 'Mostrar productos',
    cat: 'Todos',
  },
  {
    title: 'Más vendidos',
    desc: 'Explorá los productos que son tendencia.',
    img: 'https://http2.mlstatic.com/frontend-assets/homes-palermo-statics/1.0.0-beta.29/home/mas-vendidos.webp',
    btn: 'Ir a Más vendidos',
    cat: 'Todos',
  },
  {
    title: 'Tecnología',
    desc: 'Los mejores gadgets y electrónicos.',
    img: 'https://http2.mlstatic.com/frontend-assets/homes-palermo-statics/1.0.0-beta.29/home/supermercado.webp',
    btn: 'Ver tecnología',
    cat: 'Tecnología',
  },
  {
    title: 'Hogar',
    desc: 'Todo para decorar y equipar tu casa.',
    img: 'https://http2.mlstatic.com/frontend-assets/homes-palermo-statics/1.0.0-beta.29/home/moda.webp',
    btn: 'Ver hogar',
    cat: 'Hogar',
  },
]

// Fallback emojis 3D in case external images fail
const FALLBACK = ['📦','💳','💰','🏆','💻','🏠']

export default function QuickAccess({ onFilter }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.cards}>
        {CARDS.map((c, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardTitle}>{c.title}</div>
            <div className={styles.cardImgWrap}>
              <img
                src={c.img}
                alt={c.title}
                className={styles.cardImg}
                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}
              />
              <div className={styles.cardEmoji} style={{display:'none'}}>{FALLBACK[i]}</div>
            </div>
            <div className={styles.cardDesc}>{c.desc}</div>
            <button className={styles.cardBtn} onClick={() => c.cat && onFilter(c.cat)}>
              {c.btn}
            </button>
          </div>
        ))}
      </div>

      <div className={styles.promos}>
        <div className={styles.promo} style={{background:'#000'}}>
          <div className={styles.promoText}>
            <div className={styles.promoTag}>TECNO OFERTAS</div>
            <div className={styles.promoTitle}>¡HASTA 35% OFF Y{'\n'}12X SIN INTERÉS!</div>
            <div className={styles.promoLink}>Ver ofertas</div>
          </div>
          <div className={styles.promoEmoji} style={{fontSize:'6rem'}}>📱</div>
        </div>
        <div className={styles.promo} style={{background:'#1a237e'}}>
          <div className={styles.promoText}>
            <div className={styles.promoTag}>RENOVÁ TU COCINA</div>
            <div className={styles.promoTitle}>DISEÑO FUNCIONAL{'\n'}Y PRÁCTICO</div>
            <div className={styles.promoLink}>Ver ofertas</div>
          </div>
          <div className={styles.promoEmoji} style={{fontSize:'6rem'}}>🍳</div>
        </div>
      </div>
    </div>
  )
}
