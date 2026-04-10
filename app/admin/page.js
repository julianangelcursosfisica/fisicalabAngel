'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState('profesores')
  const [profesores, setProfesores] = useState([])
  const [estudiantes, setEstudiantes] = useState([])
  const [grupos, setGrupos] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [form, setForm] = useState({ full_name: '', codigo: '', email: '', password: '' })
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
    if (!prof || prof.role !== 'admin') { router.push('/login'); return }
    const { data: profs } = await supabase.from('profiles').select('*').eq('role', 'profesor').order('created_at', { ascending: false })
    setProfesores(profs || [])
    const { data: ests } = await supabase.from('profiles').select('*').eq('role', 'estudiante').order('created_at', { ascending: false })
    setEstudiantes(ests || [])
    const { data: gs } = await supabase.from('grupos').select('*, profiles(full_name)').order('created_at', { ascending: false })
    setGrupos(gs || [])
    setLoading(false)
  }

  function notify(text, type = 'success') {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: '' }), 3500)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function crearProfesor(e) {
    e.preventDefault()
    if (form.password.length < 6) { notify('Minimo 6 caracteres.', 'error'); return }
    const res = await fetch('/api/crear-usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role: 'profesor' })
    })
    const data = await res.json()
    if (!res.ok) { notify(data.error || 'Error.', 'error'); return }
    notify('Profesor creado.')
    setForm({ full_name: '', codigo: '', email: '', password: '' })
    setShowForm(false)
    loadData()
  }

  async function toggleActivo(id, activo) {
    await supabase.from('profiles').update({ activo: !activo }).eq('id', id)
    notify(activo ? 'Cuenta desactivada.' : 'Cuenta activada.')
    loadData()
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Cargando...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#e2e8f0', fontFamily: 'sans-serif' }}>

      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#1e293b', borderBottom: '1px solid #334155' }}>
        <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#38bdf8' }}>FisicaLab</span>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {['profesores', 'estudiantes', 'grupos'].map(k => (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                background: tab === k ? '#38bdf8' : 'transparent',
                color: tab === k ? '#0f172a' : '#94a3b8',
                border: 'none', borderRadius: '6px',
                padding: '0.4rem 1rem', cursor: 'pointer', fontWeight: 600
              }}
            >
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Admin</span>
          <button
            onClick={handleLogout}
            style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.9rem', cursor: 'pointer', fontWeight: 600 }}
          >
            Salir
          </button>
        </div>
      </nav>

      {/* CONTENIDO */}
      <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>

        {/* NOTIFICACION */}
        {msg.text && (
          <div style={{
            background: msg.type === 'error' ? '#7f1d1d' : '#14532d',
            color: msg.type === 'error' ? '#fca5a5' : '#86efac',
            padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 500
          }}>
            {msg.text}
          </div>
        )}

        {/* STATS */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Profesores', count: profesores.length },
            { label: 'Estudiantes', count: estudiantes.length },
            { label: 'Grupos', count: grupos.length },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: '#1e293b', borderRadius: '10px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#38bdf8' }}>{s.count}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* TAB: PROFESORES */}
        {tab === 'profesores' && (
          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: '#f1f5f9' }}>Profesores</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                style={{ background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', padding: '0.5rem 1.2rem', cursor: 'pointer', fontWeight: 700 }}
              >
                {showForm ? 'Cancelar' : '+ Nuevo profesor'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={crearProfesor} style={{ background: '#0f172a', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', color: '#38bdf8' }}>Crear profesor</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Nombre</label>
                    <input
                      value={form.full_name}
                      onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="Carlos Morales"
                      required
                      style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '0.5rem', color: '#f1f5f9', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Codigo</label>
                    <input
                      value={form.codigo}
                      onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))}
                      placeholder="P-0023"
                      required
                      style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '0.5rem', color: '#f1f5f9', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Correo</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="prof@uni.edu"
                      required
                      style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '0.5rem', color: '#f1f5f9', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Contrasena</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Min 6 caracteres"
                      required
                      style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '0.5rem', color: '#f1f5f9', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  style={{ background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', padding: '0.6rem 1.5rem', cursor: 'pointer', fontWeight: 700 }}
                >
                  Crear profesor
                </button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {profesores.length === 0 && <p style={{ color: '#64748b' }}>No hay profesores aun.</p>}
              {profesores.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#0f172a', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#38bdf8', fontSize: '0.85rem', flexShrink: 0 }}>
                    {(p.full_name || '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{p.full_name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Codigo: {p.codigo || '-'}</div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: p.activo ? '#4ade80' : '#f87171', background: p.activo ? '#14532d' : '#7f1d1d', borderRadius: '999px', padding: '2px 10px' }}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    onClick={() => toggleActivo(p.id, p.activo)}
                    style={{ background: p.activo ? '#7f1d1d' : '#14532d', color: p.activo ? '#fca5a5' : '#86efac', border: 'none', borderRadius: '6px', padding: '0.35rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    {p.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: ESTUDIANTES */}
        {tab === 'estudiantes' && (
          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1rem', color: '#f1f5f9' }}>Estudiantes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {estudiantes.length === 0 && <p style={{ color: '#64748b' }}>No hay estudiantes aun.</p>}
              {estudiantes.map(e => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#0f172a', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#38bdf8', fontSize: '0.85rem', flexShrink: 0 }}>
                    {(e.full_name || '').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{e.full_name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Codigo: {e.codigo || '-'}</div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: e.activo ? '#4ade80' : '#f87171', background: e.activo ? '#14532d' : '#7f1d1d', borderRadius: '999px', padding: '2px 10px' }}>
                    {e.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    onClick={() => toggleActivo(e.id, e.activo)}
                    style={{ background: e.activo ? '#7f1d1d' : '#14532d', color: e.activo ? '#fca5a5' : '#86efac', border: 'none', borderRadius: '6px', padding: '0.35rem 0.8rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    {e.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: GRUPOS */}
        {tab === 'grupos' && (
          <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1rem', color: '#f1f5f9' }}>Grupos</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {grupos.length === 0 && <p style={{ color: '#64748b' }}>No hay grupos aun.</p>}
              {grupos.map(g => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#0f172a', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{g.nombre}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Profesor: {g.profiles?.full_name || '-'}</div>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: g.activo ? '#4ade80' : '#f87171', background: g.activo ? '#14532d' : '#7f1d1d', borderRadius: '999px', padding: '2px 10px' }}>
                    {g.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
