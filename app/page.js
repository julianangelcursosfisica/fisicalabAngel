'use client'
import { useEffect } from 'react'
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
  return React.createElement('div',
    {style:{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}},
    React.createElement('p', {style:{color:'#888',fontSize:14}}, 'Cargando...')
  )
}
