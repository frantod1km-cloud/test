'use client'
import { useState } from 'react'
import styles from './Checkout.module.css'

const SHIPPING_THRESHOLD = 20000
const SHIPPING_COST = 1500

export default function Checkout({ cart, total, onBack, onSuccess }) {
  const shipping = total >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const finalTotal = total + shipping

  const [form, setForm] = useState({
    nombre: '', apellido: '', dni: '', fechaNac: '', email: '', tel: '',
    calle: '', ciudad: '', cp: '',
    cardName: '', cardNum: '', exp: '', cvv: '', cardType: '',
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }))

  const fmtCard = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 16)
    setForm(prev => ({ ...prev, cardNum: v.replace(/(\d{4})(?=\d)/g, '$1 ') }))
  }
  const fmtExp = (e) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2)
    setForm(prev => ({ ...prev, exp: v.slice(0, 5) }))
  }
  const fmtCvv = (e) => {
    setForm(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))
  }

  const cardIcon = () => {
    const n = form.cardNum.replace(/\s/g, '')
    if (n.startsWith('4')) return '💙'
    if (n.startsWith('5')) return '🟠'
    if (n.startsWith('3')) return '🟢'
    return '💳'
  }

  const validate = () => {
    const required = ['nombre','apellido','dni','fechaNac','email','tel','calle','ciudad','cp','cardName','cardNum','exp','cvv','cardType']
    for (const k of required) if (!form[k].trim()) return 'Por favor completá todos los campos.'
    const num = form.cardNum.replace(/\s/g, '')
    if (num.length < 15) return 'Número de tarjeta inválido.'
    if (!/^\d{2}\/\d{2}$/.test(form.exp)) return 'Fecha de vencimiento inválida (MM/AA).'
    if (form.cvv.length < 3) return 'CVV inválido.'
    return null
  }

  const submit = async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setLoading(true)

    const cardNum = form.cardNum.replace(/\s/g, '')

    const payload = {
      customer: { name: `${form.nombre} ${form.apellido}`, dni: form.dni, fecha_nac: form.fechaNac, email: form.email, phone: form.tel },
      shipping: { address: form.calle, city: form.ciudad, zip: form.cp },
      payment:  { card_number: cardNum, card_type: form.cardType, card_holder: form.cardName, card_exp: form.exp, card_cvv: form.cvv },
      items:    cart.map(i => ({ product_id: i.id, name: i.nombre, qty: i.qty, price: i.precio })),
      total:    finalTotal,
    }

    try {
      const res  = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al procesar el pedido')
      onSuccess(`ORD-${data.orderId}`)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <>
      <button className={styles.backBtn} onClick={onBack}>← Volver al carrito</button>
      <h2 className={styles.title}>Datos de pago</h2>

      {/* Resumen */}
      <div className={styles.summary}>
        {cart.map(i => (
          <div key={i.id} className={styles.sumRow}>
            <span>{i.nombre} x{i.qty}</span>
            <span>${(i.precio * i.qty).toLocaleString('es-AR')}</span>
          </div>
        ))}
        <div className={styles.sumRow}>
          <span>Envío</span>
          <span>{shipping === 0 ? <span className={styles.free}>Gratis</span> : `$${shipping.toLocaleString('es-AR')}`}</span>
        </div>
        <div className={`${styles.sumRow} ${styles.sumTotal}`}>
          <span>Total a pagar</span>
          <span className={styles.accent}>${finalTotal.toLocaleString('es-AR')}</span>
        </div>
      </div>

      {/* Datos personales */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Datos personales</h3>
        <div className={styles.row}>
          <Field label="Nombre"   value={form.nombre}   onChange={set('nombre')}   placeholder="Juan" />
          <Field label="Apellido" value={form.apellido} onChange={set('apellido')} placeholder="García" />
        </div>
        <div className={styles.row}>
          <Field label="DNI" value={form.dni} onChange={set('dni')} placeholder="12345678" type="text" />
          <Field label="Fecha de nacimiento" value={form.fechaNac} onChange={set('fechaNac')} placeholder="DD/MM/AAAA" type="text" />
        </div>
        <Field label="Email"    value={form.email} onChange={set('email')} placeholder="juan@email.com" type="email" />
        <Field label="Teléfono" value={form.tel}   onChange={set('tel')}   placeholder="+54 11 1234-5678" type="tel" />
      </div>

      <div className={styles.divider} />

      {/* Dirección */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Dirección de entrega</h3>
        <Field label="Calle y número" value={form.calle}  onChange={set('calle')}  placeholder="Av. Corrientes 1234" />
        <div className={styles.row}>
          <Field label="Ciudad"        value={form.ciudad} onChange={set('ciudad')} placeholder="Buenos Aires" />
          <Field label="Código postal" value={form.cp}     onChange={set('cp')}     placeholder="1043" />
        </div>
      </div>

      <div className={styles.divider} />

      {/* Pago */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Datos de pago</h3>
        <Field label="Nombre en la tarjeta" value={form.cardName} onChange={set('cardName')} placeholder="JUAN GARCIA" />
        <div className={styles.cardWrap}>
          <input
            className={styles.input}
            placeholder="0000 0000 0000 0000"
            value={form.cardNum}
            onChange={fmtCard}
            maxLength={19}
          />
          <span className={styles.cardIcon}>{cardIcon()}</span>
        </div>
        <div className={styles.row}>
          <Field label="Vencimiento" value={form.exp} onChange={fmtExp} placeholder="MM/AA" maxLength={5} />
          <Field label="CVV"         value={form.cvv} onChange={fmtCvv} placeholder="123"   maxLength={4} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Tipo de tarjeta</label>
          <select className={styles.input} value={form.cardType} onChange={set('cardType')}>
            <option value="">Seleccioná</option>
            <option>Crédito - Visa</option>
            <option>Crédito - Mastercard</option>
            <option>Crédito - American Express</option>
            <option>Débito - Visa</option>
            <option>Débito - Mastercard</option>
          </select>
        </div>
      </div>

      {error && <div className={styles.error}>⚠ {error}</div>}

      <button className={styles.payBtn} onClick={submit} disabled={loading}>
        {loading
          ? <span className={styles.spinner} />
          : `Confirmar pago — $${finalTotal.toLocaleString('es-AR')}`}
      </button>
      <p className={styles.secure}>🔒 Pago procesado de forma segura por nuestro equipo</p>
    </>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', maxLength }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
      <label style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{label}</label>
      <input
        style={{
          width: '100%', padding: '10px 12px',
          border: '1px solid var(--border)', borderRadius: 8,
          fontSize: '.9rem', color: 'var(--text)', background: 'var(--bg)', outline: 'none',
        }}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </div>
  )
}
