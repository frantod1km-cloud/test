'use client'
import { useState, useEffect } from 'react'
import styles from './Banner.module.css'

// Ponés tus imágenes en /public/banner/ con estos nombres
const SLIDES = [
  { img: '/banner/banner-1.webp', fallbackColor: '#1e3a8a' },
  { img: '/banner/banner-2.webp', fallbackColor: '#7c3aed' },
  { img: '/banner/banner-3.webp', fallbackColor: '#065f46' },
  { img: '/banner/banner-4.webp', fallbackColor: '#92400e' },
  { img: '/banner/banner-5.webp', fallbackColor: '#1e3a8a' },
  { img: '/banner/banner-6.webp', fallbackColor: '#831843' },
  { img: '/banner/banner-7.webp', fallbackColor: '#134e4a' },
]

export default function Banner() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const prev = () => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length)
  const next = () => setCurrent(c => (c + 1) % SLIDES.length)

  return (
    <div className={styles.wrap}>
      <div className={styles.slider}>
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className={`${styles.slide} ${i === current ? styles.active : ''}`}
            style={{ background: s.fallbackColor }}
          >
            <img src={s.img} alt={`Banner ${i + 1}`} className={styles.img} onError={e => e.target.style.display='none'} />
          </div>
        ))}
      </div>

      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prev} aria-label="Anterior">
        <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
          <path d="M9 1L1 9l8 8" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next} aria-label="Siguiente">
        <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
          <path d="M1 1l8 8-8 8" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className={styles.dots}>
        {SLIDES.map((_, i) => (
          <button key={i} className={`${styles.dot} ${i === current ? styles.dotActive : ''}`} onClick={() => setCurrent(i)} />
        ))}
      </div>
    </div>
  )
}
