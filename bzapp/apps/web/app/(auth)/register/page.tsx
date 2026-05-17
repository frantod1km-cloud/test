'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    organizationType: 'COUNTRY',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || 'Error al registrarse');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
            BZ
          </div>
          <h1 className="text-2xl font-bold">Crear tu cuenta</h1>
          <p className="text-text-2 text-sm mt-1">14 dias gratis, sin tarjeta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Tu nombre</label>
            <input
              type="text"
              className="input"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Juan Perez"
              required
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="Minimo 8 caracteres"
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="label">Nombre del barrio / edificio</label>
            <input
              type="text"
              className="input"
              value={form.organizationName}
              onChange={(e) => update('organizationName', e.target.value)}
              placeholder="Country Los Robles"
              required
            />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select
              className="input"
              value={form.organizationType}
              onChange={(e) => update('organizationType', e.target.value)}
            >
              <option value="COUNTRY">Country / Barrio privado</option>
              <option value="BUILDING">Edificio</option>
              <option value="NEIGHBORHOOD">Urbanizacion</option>
              <option value="CLUB">Club</option>
              <option value="INDUSTRIAL_PARK">Parque industrial</option>
              <option value="OFFICE">Oficinas</option>
              <option value="OTHER">Otro</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded px-3 py-2">{error}</p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creando...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-text-3 mt-6">
          Ya tenes cuenta?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Iniciar sesion
          </Link>
        </p>
      </div>
    </div>
  );
}
