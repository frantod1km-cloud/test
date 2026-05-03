'use client'
import { useState, useEffect, useCallback } from 'react'
import styles from './Banner.module.css'

// Imágenes locales en /public/banner/
// Nombralas: banner-1.webp, banner-2.webp ... banner-7.webp
const SLIDES = [
  { src: '/banner/banner-1.webp', bg: '#1a237e' },
  { src: '/banner/banner-2.webp', bg: '#880e4f' },
  { src: '/banner/banner-3.webp', bg: '#1b5e20' },
  { src: '/banner/banner-4.webp', bg: '#e65100' },
  { src: '/banner/banner-5.webp', bg: '#4a148c' },
  { src: '/banner/banner-6.webp', bg: '#006064' },
  { src: '/banner/banner-7.webp', bg: '#b71c1c' },
]

export default function Banner() {
  const [current, setCurrent] = useState(0)
  const [failed, setFailed]   = useState({})

  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), [])
  const prev = useCallback(() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length), [])

  useEffect(() => {
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [next])

  return (
    <div className={styles.wrap}>
      <div className={styles.track} style={{ transform: `translateX(-${current * 100}%)` }}>
        {SLIDES.map((s, i) => (
          <div key={i} className={styles.slide} style={{ background: s.bg }}>
            {!failed[i] && (
              <img
                src={s.src}
                alt={`Promo ${i + 1}`}
                className={styles.img}
                onError={() => setFailed(p => ({ ...p, [i]: true }))}
              />
            )}
          </div>
        ))}
      </div>

      <button className={`${styles.arrow} ${styles.left}`} onClick={prev}>
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7l6 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <button className={`${styles.arrow} ${styles.right}`} onClick={next}>
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M1 1l6 6-6 6" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>

      <div className={styles.dots}>
        {SLIDES.map((_, i) => (
          <button key={i} className={`${styles.dot} ${i === current ? styles.dotActive : ''}`} onClick={() => setCurrent(i)} />
        ))}
      </div>
    </div>
  )
}
