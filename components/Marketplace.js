'use client'
import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Marketplace.module.css'

import Navbar       from './Navbar'
import Banner       from './Banner'
import QuickAccess  from './QuickAccess'
import ProductGrid  from './ProductGrid'
import Drawer       from './Drawer'
import CartView     from './CartView'
import Checkout     from './Checkout'
import Success      from './Success'

const CATS = ['Todos', 'Cocina', 'Tecnología', 'Hogar', 'Moda', 'Electrónica', 'Deportes', 'Juguetes', 'Otros']

export default function Marketplace() {
  const [productos, setProductos]   = useState([])
  const [loadingP, setLoadingP]     = useState(true)
  const [cart, setCart]             = useState([])
  const [category, setCategory]     = useState('Todos')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [view, setView]             = useState('cart')
  const [orderId, setOrderId]       = useState(null)
  const [toast, setToast]           = useState(null)

  useEffect(() => {
    supabase.from('productos').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setProductos(data || []); setLoadingP(false) })
  }, [])

  const filtered = category === 'Todos'
    ? productos
    : productos.filter(p => p.categoria === category)

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)
  const getTotal  = () => cart.reduce((s, i) => s + i.precio * i.qty, 0)

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const ex = prev.find(x => x.id === product.id)
      if (ex) return prev.map(x => x.id === product.id ? { ...x, qty: x.qty + 1 } : x)
      return [...prev, { ...product, qty: 1 }]
    })
    showToast(`✓ ${product.nombre} agregado al carrito`)
  }, [])

  const changeQty = useCallback((id, delta) => {
    setCart(prev => prev.map(x => x.id === id ? { ...x, qty: x.qty + delta } : x).filter(x => x.qty > 0))
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }
  const openCart = () => { setView('cart'); setDrawerOpen(true) }
  const handleOrderSuccess = (id) => { setOrderId(id); setCart([]); setView('success') }

  return (
    <>
      <Navbar cartCount={cartCount} onCartClick={openCart} />
      <Banner />
      <QuickAccess onFilter={setCategory} />

      <div className={styles.filtersWrap}>
        <div className={styles.filters}>
          {CATS.map(cat => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${category === cat ? styles.active : ''}`}
              onClick={() => setCategory(cat)}
            >{cat}</button>
          ))}
        </div>
      </div>

      <div className={styles.sectionTitle}>
        {category === 'Todos' ? 'Todos los productos' : category}
        <span className={styles.count}>({filtered.length} resultados)</span>
      </div>

      {loadingP
        ? <div className={styles.loading}>Cargando productos...</div>
        : <ProductGrid products={filtered} onAdd={addToCart} />
      }

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
