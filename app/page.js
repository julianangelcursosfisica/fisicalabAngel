'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', session.user.id).single()
      if (profile?.role === 'admin') router.push('/admin')
      else if (profile?.role === 'profesor') router.push('/profesor')
      else router.push('/estudiante')
    })
  }, [router])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
      <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>Cargando...</p>
    </div>
  )
}
