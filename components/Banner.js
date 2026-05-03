'use client'
import { useState, useEffect, useCallback } from 'react'
import styles from './Banner.module.css'

const SLIDES = [
  '/banner/banner-1.webp',
  '/banner/banner-2.webp',
  '/banner/banner-3.webp',
  '/banner/banner-4.webp',
  '/banner/banner-5.webp',
  '/banner/banner-6.webp',
  '/banner/banner-7.webp',
]

export default function Banner() {
  const [current, setCurrent] = useState(0)
  const [errors, setErrors]   = useState({})

  const prev = useCallback(() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length), [])
  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), [])

  useEffect(() => {
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [next])

  return (
    <div className={styles.wrap}>
      <div className={styles.track} style={{ transform: `translateX(-${current * 100}%)` }}>
        {SLIDES.map((src, i) => (
          <div key={i} className={styles.slide}>
            {!errors[i]
              ? <img
                  src={src}
                  alt={`Banner ${i + 1}`}
                  className={styles.img}
                  onError={() => setErrors(p => ({ ...p, [i]: true }))}
                />
              : <div className={styles.fallback}>
                  <span>Banner {i + 1}</span>
                  <small>{src}</small>
                </div>
            }
          </div>
        ))}
      </div>

      <button className={`${styles.arrow} ${styles.left}`} onClick={prev}>
        <svg width="9" height="16" viewBox="0 0 9 16"><path d="M8 1L1 8l7 7" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
      </button>
      <button className={`${styles.arrow} ${styles.right}`} onClick={next}>
        <svg width="9" height="16" viewBox="0 0 9 16"><path d="M1 1l7 7-7 7" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
      </button>

      <div className={styles.dots}>
        {SLIDES.map((_, i) => (
          <button key={i} className={`${styles.dot} ${i === current ? styles.dotActive : ''}`} onClick={() => setCurrent(i)} />
        ))}
      </div>
    </div>
  )
}
