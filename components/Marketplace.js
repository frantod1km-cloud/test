'use client'
import { useState, useCallback } from 'react'
import { PRODUCTS, CATEGORIES } from '../lib/products'
import styles from './Marketplace.module.css'

import Navbar      from './Navbar'
import ProductGrid from './ProductGrid'
import Drawer      from './Drawer'
import CartView    from './CartView'
import Checkout    from './Checkout'
import Success     from './Success'

const CATS = ['Todos', 'Cocina', 'Tecnología', 'Hogar', 'Moda']

export default function Marketplace() {
  const [cart, setCart]             = useState([])
  const [category, setCategory]     = useState('Todos')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [view, setView]             = useState('cart')
  const [orderId, setOrderId]       = useState(null)
  const [toast, setToast]           = useState(null)

  const filtered = category === 'Todos'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === category)

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const getTotal  = () => cart.reduce((s, i) => s + i.price * i.qty, 0)

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(x => x.id === product.id)
      if (existing) return prev.map(x => x.id === product.id ? { ...x, qty: x.qty + 1 } : x)
      return [...prev, { ...product, qty: 1 }]
    })
    showToast(`${product.emoji} ${product.name} agregado al carrito`)
  }, [])

  const changeQty = useCallback((id, delta) => {
    setCart(prev => prev.map(x => x.id === id ? { ...x, qty: x.qty + delta } : x).filter(x => x.qty > 0))
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const openCart = () => { setView('cart'); setDrawerOpen(true) }

  const handleOrderSuccess = (id) => {
    setOrderId(id); setCart([]); setView('success')
  }

  return (
    <>
      <Navbar cartCount={cartCount} onCartClick={openCart} />

      {/* Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerBadge}>ENVÍO GRATIS en compras +$20.000</div>
        <h1>Descuentos todos los días</h1>
        <p>Los mejores precios en tecnología, hogar, moda y más</p>
      </div>

      {/* Filtros */}
      <div className={styles.filtersWrap}>
        <div className={styles.filtersLabel}>Categorías</div>
        <div className={styles.filters}>
          {CATS.map(cat => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${category === cat ? styles.active : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.sectionTitle}>
        {category === 'Todos' ? 'Todos los productos' : category}
        <span style={{ fontSize: '1rem', color: '#999', fontWeight: 400, marginLeft: 8 }}>
          ({filtered.length} resultados)
        </span>
      </div>

      <ProductGrid products={filtered} onAdd={addToCart} />

      {toast && <div className={styles.toast}>{toast}</div>}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {view === 'cart' && (
          <CartView cart={cart} total={getTotal()} onChangeQty={changeQty} onCheckout={() => setView('checkout')} />
        )}
        {view === 'checkout' && (
          <Checkout cart={cart} total={getTotal()} onBack={() => setView('cart')} onSuccess={handleOrderSuccess} />
        )}
        {view === 'success' && (
          <Success orderId={orderId} onClose={() => { setDrawerOpen(false); setView('cart') }} />
        )}
      </Drawer>
    </>
  )
}
