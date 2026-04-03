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
    if (form.password.length < 6) { notify('La contrasena debe tener al menos 6 caracteres.','error'); return }
    const res = await fetch('/api/crear-usuario', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({...form, role:'profesor'})
    })
    const data = await res.json()
    if (!res.ok) { notify(data.error||'Error al crear profesor.','error'); return }
    notify('Profesor creado exitosamente.')
    setForm({full_name:'',codigo:'',email:'',password:''})
    setShowForm(false); loadData()
  }

  async function toggleActivo(id, activo) {
    await supabase.from('profiles').update({activo:!activo}).eq('id',id)
    notify(activo?'Cuenta desactivada.':'Cuenta activada.')
    loadData()
  }

  if (loading) return (
    

      

Cargando...


    

  )

  return (
    

      

        FisicaLab
        

          {[['profesores','Profesores'],['estudiantes','Estudiantes'],['grupos','Grupos']].map(([k,l])=>(
            setTab(k)}>{l}
          ))}
        

        

          Admin
          Salir
        

      

      

        {msg.text && 
{msg.text}
}
        

          
{profesores.length}
Profesores

          
{estudiantes.length}
Estudiantes

          
{grupos.length}
Grupos

        

        {tab==='profesores' && (
          

            

              

Profesores


              setShowForm(!showForm)}>
                {showForm?'Cancelar':'+ Nuevo profesor'}
              
            

            {showForm && (
              

                

Crear cuenta de profesor


                

                  

                    
Nombre completosetForm(f=>({...f,full_name:e.target.value}))} placeholder="Ej: Carlos Morales" required/>

                    
ID CodigosetForm(f=>({...f,codigo:e.target.value}))} placeholder="Ej: P-0023" required/>

                  

                  

                    
CorreosetForm(f=>({...f,email:e.target.value}))} placeholder="profesor@uni.edu" required/>

                    
Contrasena temporalsetForm(f=>({...f,password:e.target.value}))} placeholder="Min. 6 caracteres" required/>

                  

                  Crear profesor
                

              

            )}
            

              {profesores.length===0 && 

No hay profesores registrados aun.

}
              {profesores.map(p=>(
                

                  

                    {p.full_name?.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
                  

                  

                    

{p.full_name}


                    

Codigo: {p.codigo||'-'} - {new Date(p.created_at).toLocaleDateString('es-CO')}


                  

                  {p.activo?'Activo':'Inactivo'}
                  toggleActivo(p.id,p.activo)}>{p.activo?'Desactivar':'Activar'}
                

              ))}
            

          

        )}
        {tab==='estudiantes' && (
          

            

Estudiantes registrados


            

              {estudiantes.length===0 && 

No hay estudiantes aun. Los profesores los inscriben en sus grupos.

}
              {estudiantes.map(e=>(
                

                  

                    {e.full_name?.split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
                  

                  

                    

{e.full_name}


                    

Codigo: {e.codigo||'-'} - {new Date(e.created_at).toLocaleDateString('es-CO')}


                  

                  {e.activo?'Activo':'Inactivo'}
                  toggleActivo(e.id,e.activo)}>{e.activo?'Desactivar':'Activar'}
                

              ))}
            

          

        )}
        {tab==='grupos' && (
          

            

Todos los grupos


            

              {grupos.length===0 && 

No hay grupos creados aun.

}
              {grupos.map(g=>(
                

                  

                    

{g.nombre}


                    

Profesor: {g.profiles?.full_name||'-'} - {g.horario||'Sin horario'}


                  

                  {g.activo?'Activo':'Inactivo'}
                

              ))}
            

          

        )}
      

    

  )
}
