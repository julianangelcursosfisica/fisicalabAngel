import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    const { full_name, codigo, email, password, role, grupo_id } = await request.json()

    const supabaseAdmin = createClient(
      'https://abgiznvycemsqoxwvczn.supabase.co',
      process.env.SUPABASE_SERVICE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, codigo, role }
    })

    if (error) return Response.json({ error: error.message }, { status: 400 })

    if (grupo_id && data.user) {
      await supabaseAdmin.from('grupo_estudiantes').insert({
        grupo_id,
        estudiante_id: data.user.id
      })
    }

    return Response.json({ success: true })
  } catch (err) {
    return Response.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
