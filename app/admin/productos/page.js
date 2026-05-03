'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import styles from './Productos.module.css'

const EMPTY = {
  nombre: '', descripcion: '', precio: '', categoria: '',
  imagen_url: '', stock: '', cuotas: '', envio_gratis: false, destacado: false
}

const CATEGORIAS = ['Cocina', 'Tecnología', 'Hogar', 'Moda', 'Electrónica', 'Deportes', 'Juguetes', 'Otros']

export default function AdminProductos() {
  const [productos, setProductos]   = useState([])
  const [form, setForm]             = useState(EMPTY)
  const [editId, setEditId]         = useState(null)
  const [loading, setLoading]       = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [showForm, setShowForm]     = useState(false)
  const [search, setSearch]         = useState('')
  const [msg, setMsg]               = useState(null)
  const router = useRouter()

  useEffect(() => { checkAuth(); fetchProductos() }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) router.push('/admin/login')
  }

  const fetchProductos = async () => {
    const { data } = await supabase.from('productos').select('*').order('created_at', { ascending: false })
    setProductos(data || [])
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [k]: val }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `productos/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('imagenes').upload(path, file, { upsert: true })
    if (error) { showMsg('Error al subir imagen: ' + error.message, 'error'); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('imagenes').getPublicUrl(path)
    setForm(prev => ({ ...prev, imagen_url: publicUrl }))
    setUploading(false)
    showMsg('Imagen subida correctamente ✓', 'ok')
  }

  const handleSubmit = async () => {
    if (!form.nombre || !form.precio || !form.categoria) { showMsg('Completá nombre, precio y categoría.', 'error'); return }
    setLoading(true)
    const payload = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: Number(form.precio),
      categoria: form.categoria,
      imagen_url: form.imagen_url,
      stock: Number(form.stock) || 0,
      cuotas: Number(form.cuotas) || 1,
      envio_gratis: form.envio_gratis,
      destacado: form.destacado,
    }
    if (editId) {
      await supabase.from('productos').update(payload).eq('id', editId)
      showMsg('Producto actualizado ✓', 'ok')
    } else {
      await supabase.from('productos').insert([payload])
      showMsg('Producto creado ✓', 'ok')
    }
    setForm(EMPTY); setEditId(null); setShowForm(false); setLoading(false)
    fetchProductos()
  }

  const handleEdit = (p) => {
    setForm({ ...p, precio: String(p.precio), stock: String(p.stock), cuotas: String(p.cuotas) })
    setEditId(p.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    await supabase.from('productos').delete().eq('id', id)
    showMsg('Producto eliminado', 'ok')
    fetchProductos()
  }

  const showMsg = (text, type) => {
    setMsg({ text, type })
    setTimeout(() => setMsg(null), 3000)
  }

  const filtered = productos.filter(p =>
    p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    p.categoria?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLogo}>
          <span className={styles.logoTop}>MercadoChucu</span>
          <span className={styles.logoSub}>Panel Admin</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.prodCount}>{productos.length} productos</span>
          <button className={styles.logoutBtn} onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>

      <div className={styles.container}>

        {/* MENSAJE */}
        {msg && <div className={`${styles.msg} ${styles[msg.type]}`}>{msg.text}</div>}

        {/* TOOLBAR */}
        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            placeholder="Buscar producto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className={styles.newBtn} onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(v => !v) }}>
            {showForm && !editId ? '✕ Cancelar' : '+ Nuevo producto'}
          </button>
        </div>

        {/* FORMULARIO */}
        {showForm && (
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>{editId ? 'Editar producto' : 'Nuevo producto'}</h2>
            <div className={styles.formGrid}>
              <div className={styles.formCol}>
                <Field label="Nombre *" value={form.nombre} onChange={set('nombre')} placeholder="Ej: Auriculares Bluetooth" />
                <Field label="Descripción" value={form.descripcion} onChange={set('descripcion')} placeholder="Descripción breve del producto" textarea />
                <div className={styles.row}>
                  <Field label="Precio * ($)" value={form.precio} onChange={set('precio')} placeholder="24900" type="number" />
                  <Field label="Stock" value={form.stock} onChange={set('stock')} placeholder="10" type="number" />
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Categoría *</label>
                    <select className={styles.input} value={form.categoria} onChange={set('categoria')}>
                      <option value="">Seleccioná</option>
                      {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <Field label="Cuotas sin interés" value={form.cuotas} onChange={set('cuotas')} placeholder="12" type="number" />
                </div>
                <div className={styles.checks}>
                  <label className={styles.checkLabel}>
                    <input type="checkbox" checked={form.envio_gratis} onChange={set('envio_gratis')} />
                    Envío gratis
                  </label>
                  <label className={styles.checkLabel}>
                    <input type="checkbox" checked={form.destacado} onChange={set('destacado')} />
                    Destacado
                  </label>
                </div>
              </div>

              <div className={styles.formCol}>
                <div className={styles.field}>
                  <label className={styles.label}>Imagen del producto</label>
                  <div className={styles.uploadArea}>
                    {form.imagen_url
                      ? <img src={form.imagen_url} alt="preview" className={styles.preview} />
                      : <div className={styles.uploadPlaceholder}>📷<br />Sin imagen</div>
                    }
                    <label className={styles.uploadBtn}>
                      {uploading ? 'Subiendo...' : '📁 Subir imagen'}
                      <input type="file" accept="image/*,.webp" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                    <div className={styles.uploadNote}>o pegá una URL:</div>
                    <input className={styles.input} value={form.imagen_url} onChange={set('imagen_url')} placeholder="https://..." />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button className={styles.cancelBtn} onClick={() => { setShowForm(false); setForm(EMPTY); setEditId(null) }}>Cancelar</button>
              <button className={styles.saveBtn} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Guardando...' : editId ? 'Guardar cambios' : 'Crear producto'}
              </button>
            </div>
          </div>
        )}

        {/* TABLA */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Cuotas</th>
                <th>Extras</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className={styles.empty}>No hay productos todavía.</td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id} className={p.destacado ? styles.highlighted : ''}>
                  <td>
                    {p.imagen_url
                      ? <img src={p.imagen_url} alt={p.nombre} className={styles.thumb} />
                      : <div className={styles.noImg}>📦</div>
                    }
                  </td>
                  <td className={styles.tdName}>
                    {p.nombre}
                    {p.destacado && <span className={styles.badge}>⭐ Destacado</span>}
                  </td>
                  <td><span className={styles.cat}>{p.categoria}</span></td>
                  <td className={styles.tdPrice}>${Number(p.precio).toLocaleString('es-AR')}</td>
                  <td className={p.stock === 0 ? styles.noStock : ''}>{p.stock}</td>
                  <td>{p.cuotas}x</td>
                  <td>
                    {p.envio_gratis && <span className={styles.ship}>🚚 Gratis</span>}
                  </td>
                  <td className={styles.actions}>
                    <button className={styles.editBtn} onClick={() => handleEdit(p)}>Editar</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', textarea }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
      <label style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>{label}</label>
      {textarea
        ? <textarea style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: '.9rem', outline: 'none', resize: 'vertical', minHeight: 80, fontFamily: 'inherit' }} value={value} onChange={onChange} placeholder={placeholder} />
        : <input style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: '.9rem', outline: 'none' }} type={type} value={value} onChange={onChange} placeholder={placeholder} />
      }
    </div>
  )
}
