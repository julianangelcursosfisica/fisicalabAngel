'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Correo o contrasena incorrectos.')
      setLoading(false)
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    const { data: profile } = await supabase
      .from('profiles').select('role,activo').eq('id', session.user.id).single()
    if (!profile?.activo) {
      await supabase.auth.signOut()
      setError('Tu cuenta esta desactivada.')
      setLoading(false)
      return
    }
    if (!profile?.activo && profile?.role !== 'admin') {
  await supabase.auth.signOut()
  setError('Tu cuenta esta desactivada.')
  setLoading(false)
  return
}

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1rem', background: '#f5f5f0' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, background: '#185FA5', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: 20, color: '#fff', fontWeight: 700 }}>
            FL
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#185FA5' }}>FisicaLab</h1>
          <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Laboratorios de Fisica</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: '1.25rem' }}>Iniciar sesion</h2>

          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 8, padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' }}>Correo</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.edu"
                required
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' }}>Contrasena</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="........"
                required
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, boxSizing: 'border-box' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: 11, marginTop: 4, background: '#185FA5', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center', marginTop: '1rem' }}>
            Solo pueden ingresar usuarios registrados por el administrador o su profesor.
          </p>
        </div>
      </div>
    </div>
  )
}
