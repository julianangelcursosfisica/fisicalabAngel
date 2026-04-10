'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState('profesores')
  const [profesores, setProfesores] = useState([])
  const [estudiantes, setEstudiantes] = useState([])
  const [grupos, setGrupos] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState({ text:'', type:'' })
  const [form, setForm] = useState({ full_name:'', codigo:'', email:'', password:'' })
  const [showForm, setShowForm] = useState(false)
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
    if (!prof || prof.role !== 'admin') { router.push('/login'); return }
    const { data: profs } = await supabase.from('profiles').select('*').eq('role','profesor').order('created_at',{ascending:false})
    setProfesores(profs||[])
    const { data: ests } = await supabase.from('profiles').select('*').eq('role','estudiante').order('created_at',{ascending:false})
    setEstudiantes(ests||[])
    const { data: gs } = await supabase.from('grupos').select('*, profiles(full_name)').order('created_at',{ascending:false})
    setGrupos(gs||[])
    setLoading(false)
  }

  function notify(text, type='success') { setMsg({text,type}); setTimeout(()=>setMsg({text:'',type:''}),3500) }
  async function handleLogout() { await supabase.auth.signOut(); router.push('/login') }

  async function crearProfesor(e) {
    e.preventDefault()
    if (form.password.length < 6) { notify('Minimo 6 caracteres.','error'); return }
    const res = await fetch('/api/crear-usuario', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({...form, role:'profesor'})
    })
    const data = await res.json()
    if (!res.ok) { notify(data.error||'Error.','error'); return }
    notify('Profesor creado.')
    setForm({full_name:'',codigo:'',email:'',password:''})
    setShowForm(false); loadData()
  }

  async function toggleActivo(id, activo) {
    await supabase.from('profiles').update({activo:!activo}).eq('id',id)
    notify(activo?'Cuenta desactivada.':'Cuenta activada.')
    loadData()
  }

  if (loading) {
    return React.createElement('div',
      {style:{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}},
      React.createElement('p', {style:{color:'#888'}}, 'Cargando...')
    )
  }

  function ProfRow(p) {
    return React.createElement('div', {key:p.id, className:'table-row'},
      React.createElement('div', {className:'avatar', style:{background:'#C0DD97',color:'#27500A',flexShrink:0}},
        (p.full_name||'').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()
      ),
      React.createElement('div', {style:{flex:1}},
        React.createElement('p', {style:{fontSize:14,fontWeight:600}}, p.full_name),
        React.createElement('p', {style:{fontSize:12,color:'#888'}}, 'Codigo: '+(p.codigo||'-'))
      ),
      React.createElement('span', {className:'badge '+(p.activo?'badge-success':'badge-danger')}, p.activo?'Activo':'Inactivo'),
      React.createElement('button', {className:p.activo?'btn-danger':'btn-success', onClick:()=>toggleActivo(p.id,p.activo)}, p.activo?'Desactivar':'Activar')
    )
  }

  function EstRow(e) {
    return React.createElement('div', {key:e.id, className:'table-row'},
      React.createElement('div', {className:'avatar', style:{background:'#B5D4F4',color:'#0C447C',flexShrink:0}},
        (e.full_name||'').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()
      ),
      React.createElement('div', {style:{flex:1}},
        React.createElement('p', {style:{fontSize:14,fontWeight:600}}, e.full_name),
        React.createElement('p', {style:{fontSize:12,color:'#888'}}, 'Codigo: '+(e.codigo||'-'))
      ),
      React.createElement('span', {className:'badge '+(e.activo?'badge-success':'badge-danger')}, e.activo?'Activo':'Inactivo'),
      React.createElement('button', {className:e.activo?'btn-danger':'btn-success', onClick:()=>toggleActivo(e.id,e.activo)}, e.activo?'Desactivar':'Activar')
    )
  }

  return React.createElement('div', null,
    React.createElement('nav', {className:'nav'},
      React.createElement('span', {className:'nav-logo'}, 'FisicaLab'),
      React.createElement('div', {className:'nav-tabs'},
        ['profesores','estudiantes','grupos'].map(k =>
          React.createElement('button', {key:k, className:'nav-tab '+(tab===k?'active':''), onClick:()=>setTab(k)},
            k.charAt(0).toUpperCase()+k.slice(1)
          )
        )
      ),
      React.createElement('div', {className:'nav-user'},
        React.createElement('span', {className:'badge badge-purple'}, 'Admin'),
        React.createElement('button', {className:'btn-secondary', style:{fontSize:12,padding:'5px 12px'}, onClick:handleLogout}, 'Salir')
      )
    ),
    React.createElement('div', {className:'page'},
      msg.text ? React.createElement('div', {className:msg.type==='error'?'error-box':'success-box'}, msg.text) : null,

      React.createElement('div', {className:'metrics-grid', style:{gridTemplateColumns:'repeat(3,1fr)'}},
        React.createElement('div', {className:'metric'}, React.createElement('div', {className:'metric-val', style:{color:'#534AB7'}}, profesores.length), React.createElement('div', {className:'metric-lbl'}, 'Profesores')),
        React.createElement('div', {className:'metric'}, React.createElement('div', {className:'metric-val', style:{color:'#185FA5'}}, estudiantes.length), React.createElement('div', {className:'metric-lbl'}, 'Estudiantes')),
        React.createElement('div', {className:'metric'}, React.createElement('div', {className:'metric-val', style:{color:'#1D9E75'}}, grupos.length), React.createElement('div', {className:'metric-lbl'}, 'Grupos'))
      ),

      tab==='profesores' ? React.createElement('div', null,
        React.createElement('div', {style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}},
          React.createElement('p', {style:{fontSize:18,fontWeight:700}}, 'Profesores'),
          React.createElement('button', {className:'btn-primary', style:{fontSize:13,padding:'8px 16px'}, onClick:()=>setShowForm(!showForm)}, showForm?'Cancelar':'+ Nuevo profesor')
        ),
        showForm ? React.createElement('div', {className:'card', style:{marginBottom:'1rem',borderColor:'#85B7EB'}},
          React.createElement('p', {style:{fontSize:14,fontWeight:700,marginBottom:'0.75rem'}}, 'Crear profesor'),
          React.createElement('form', {onSubmit:crearProfesor},
            React.createElement('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}},
              React.createElement('div', {className:'form-group', style:{margin:0}}, React.createElement('label', null, 'Nombre'), React.createElement('input', {value:form.full_name, onChange:e=>setForm(f=>({...f,full_name:e.target.value})), placeholder:'Carlos Morales', required:true})),
              React.createElement('div', {className:'form-group', style:{margin:0}}, React.createElement('label', null, 'Codigo'), React.createElement('input', {value:form.codigo, onChange:e=>setForm(f=>({...f,codigo:e.target.value})), placeholder:'P-0023', required:true}))
            ),
            React.createElement('div', {style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:10}},
              React.createElement('div', {className:'form-group', style:{margin:0}}, React.createElement('label', null, 'Correo'), React.createElement('input', {type:'email', value:form.email, onChange:e=>setForm(f=>({...f,email:e.target.value})), placeholder:'prof@uni.edu', required:true})),
              React.createElement('div', {className:'form-group', style:{margin:0}}, React.createElement('label', null, 'Contrasena'), React.createElement('input', {type:'password', value:form.password, onChange:e=>setForm(f=>({...f,password:e.target.value})), placeholder:'Min 6 caracteres', required:true}))
            ),
            React.createElement('button', {type:'submit', className:'btn-primary', style:{fontSize:13,padding:'8px 18px',marginTop:14}}, 'Crear profesor')
          )
        ) : null,
        React.createElement('div', {className:'card'},
          profesores.length===0 ? React.createElement('p', {style:{fontSize:13,color:'#888'}}, 'No hay profesores aun.') : profesores.map(p => ProfRow(p))
        )
      ) : null,

      tab==='estudiantes' ? React.createElement('div', null,
        React.createElement('p', {style:{fontSize:18,fontWeight:700,marginBottom:'1.25rem'}}, 'Estudiantes'),
        React.createElement('div', {className:'card'},
          estudiantes.length===0 ? React.createElement('p', {style:{fontSize:13,color:'#888'}}, 'No hay estudiantes aun.') : estudiantes.map(e => EstRow(e))
        )
      ) : null,

      tab==='grupos' ? React.createElement('div', null,
        React.createElement('p', {style:{fontSize:18,fontWeight:700,marginBottom:'1.25rem'}}, 'Grupos'),
        React.createElement('div', {className:'card'},
          grupos.length===0 ? React.createElement('p', {style:{fontSize:13,color:'#888'}}, 'No hay grupos aun.') :
          grupos.map(g => React.createElement('div', {key:g.id, className:'table-row'},
            React.createElement('div', {style:{flex:1}},
              React.createElement('p', {style:{fontSize:14,fontWeight:600}}, g.nombre),
              React.createElement('p', {style:{fontSize:12,color:'#888'}}, 'Profesor: '+(g.profiles?.full_name||'-'))
            ),
            React.createElement('span', {className:'badge '+(g.activo?'badge-success':'badge-danger')}, g.activo?'Activo':'Inactivo')
          ))
        )
      ) : null
    )
  )
}
