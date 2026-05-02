'use client'
import { useState, useCallback } from 'react'
import { PRODUCTS, CATEGORIES } from '../lib/products'
import styles from './Marketplace.module.css'

// ── sub-components ────────────────────────────────────────────────
import Navbar    from './Navbar'
import ProductGrid from './ProductGrid'
import Drawer    from './Drawer'
import CartView  from './CartView'
import Checkout  from './Checkout'
import Success   from './Success'

export default function Marketplace() {
  const [cart, setCart]           = useState([])
  const [category, setCategory]   = useState('Todos')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [view, setView]           = useState('cart') // 'cart' | 'checkout' | 'success'
  const [orderId, setOrderId]     = useState(null)
  const [toast, setToast]         = useState(null)

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
    showToast(`${product.emoji} ${product.name} agregado`)
  }, [])

  const changeQty = useCallback((id, delta) => {
    setCart(prev => {
      const updated = prev.map(x => x.id === id ? { ...x, qty: x.qty + delta } : x)
      return updated.filter(x => x.qty > 0)
    })
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const openCart = () => {
    setView('cart')
    setDrawerOpen(true)
  }

  const handleOrderSuccess = (id) => {
    setOrderId(id)
    setCart([])
    setView('success')
  }

  return (
    <>
      <Navbar
        cartCount={cartCount}
        onCartClick={openCart}
      />

      <div className={styles.hero}>
        <h1>Productos<br />seleccionados</h1>
        <p>Artículos de calidad con envío a todo el país</p>
      </div>

      <div className={styles.filters}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${category === cat ? styles.active : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <ProductGrid products={filtered} onAdd={addToCart} />

      {toast && <div className={styles.toast}>{toast}</div>}

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {view === 'cart' && (
          <CartView
            cart={cart}
            total={getTotal()}
            onChangeQty={changeQty}
            onCheckout={() => setView('checkout')}
          />
        )}
        {view === 'checkout' && (
          <Checkout
            cart={cart}
            total={getTotal()}
            onBack={() => setView('cart')}
            onSuccess={handleOrderSuccess}
          />
        )}
        {view === 'success' && (
          <Success
            orderId={orderId}
            onClose={() => { setDrawerOpen(false); setView('cart') }}
          />
        )}
      </Drawer>
    </>
  )
}
