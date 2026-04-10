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
    if (profile?.role === 'admin') router.push('/admin')
    else if (profile?.role === 'profesor') router.push('/profesor')
    else router.push('/estudiante')
  }

  const logoStyle = {
    width:56, height:56, background:'#185FA5', borderRadius:16,
    display:'flex', alignItems:'center', justifyContent:'center',
    margin:'0 auto 1rem', fontSize:20, color:'#fff', fontWeight:700
  }

  return React.createElement('div',
    {style:{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',padding:'1rem',background:'#f5f5f0'}},
    React.createElement('div', {style:{width:'100%',maxWidth:400}},
      React.createElement('div', {style:{textAlign:'center',marginBottom:'2rem'}},
        React.createElement('div', {style:logoStyle}, 'FL'),
        React.createElement('h1', {style:{fontSize:24,fontWeight:700,color:'#185FA5'}}, 'FisicaLab'),
        React.createElement('p', {style:{fontSize:13,color:'#888',marginTop:4}}, 'Laboratorios de Fisica')
      ),
      React.createElement('div', {className:'card'},
        React.createElement('h2', {style:{fontSize:16,fontWeight:700,marginBottom:'1.25rem'}}, 'Iniciar sesion'),
        error ? React.createElement('div', {className:'error-box'}, error) : null,
        React.createElement('form', {onSubmit:handleLogin},
          React.createElement('div', {className:'form-group'},
            React.createElement('label', null, 'Correo'),
            React.createElement('input', {type:'email', value:email, onChange:e=>setEmail(e.target.value), placeholder:'tu@correo.edu', required:true})
          ),
          React.createElement('div', {className:'form-group'},
            React.createElement('label', null, 'Contrasena'),
            React.createElement('input', {type:'password', value:password, onChange:e=>setPassword(e.target.value), placeholder:'........', required:true})
          ),
          React.createElement('button', {type:'submit', className:'btn-primary', disabled:loading, style:{width:'100%',padding:11,marginTop:4}},
            loading ? 'Ingresando...' : 'Ingresar'
          )
        ),
        React.createElement('p', {style:{fontSize:12,color:'#aaa',textAlign:'center',marginTop:'1rem'}},
          'Solo pueden ingresar usuarios registrados por el administrador o su profesor.'
        )
      )
    )
  )
}
