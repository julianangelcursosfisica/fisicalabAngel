'use client'
import { useState } from 'react'
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
    setError(''); setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError('Correo o contraseña incorrectos.'); setLoading(false); return }
    const { data: { session } } = await supabase.auth.getSession()
    const { data: profile } = await supabase.from('profiles').select('role,activo').eq('id', session.user.id).single()
    if (!profile?.activo) { await supabase.auth.signOut(); setError('Tu cuenta está desactivada. Contacta al administrador.'); setLoading(false); return }
    if (profile?.role === 'admin') router.push('/admin')
    else if (profile?.role === 'profesor') router.push('/profesor')
    else router.push('/estudiante')
  }

  return (
    

      

        

          
⚗️

          
FisicaLab

          

Plataforma de Laboratorios de Física


        

        

          
Iniciar sesión

          {error && 
{error}
}
          

            

              Correo
              setEmail(e.target.value)} placeholder="tu@correo.edu" required />
            

            

              Contraseña
              setPassword(e.target.value)} placeholder="••••••••" required />
            

            
              {loading ? 'Ingresando...' : 'Ingresar'}
            
          

          


            Solo pueden ingresar usuarios registrados por el administrador o su profesor.
          


        

      

    

  )
}
