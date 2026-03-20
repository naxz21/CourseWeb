import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/is-admin'
import { createClient } from '@/lib/supabase/server'
import EditModuleForm from '@/components/admin/EditModuleForm'

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { user, isAdmin } = await requireAdmin()
  if (!user) redirect('/login')
  if (!isAdmin) redirect('/dashboard')

  const { id } = await params
  const supabase = await createClient()

  const [{ data: module, error }, { data: courses }] = await Promise.all([
    supabase.from('modules').select('*').eq('id', id).single(),
    supabase.from('courses').select('id, title').order('title', { ascending: true }),
  ])

  if (error || !module) {
    return (
      <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5F2E8 0%, #EDE8D5 100%)', fontFamily: 'Georgia, serif', padding: '3rem 2rem' }}>
        <h1 style={{ color: '#2D5A27', marginBottom: '1rem' }}>Módulo no encontrado</h1>
        <Link href="/admin/modulos" style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', textDecoration: 'none', fontSize: '0.875rem' }}>← Volver</Link>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5F2E8 0%, #EDE8D5 100%)', fontFamily: 'Georgia, serif' }}>
      <header style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(74,124,63,0.15)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A7C3F' }}>Admin · Módulos · Editar</span>
        <Link href="/admin/modulos" style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.875rem', textDecoration: 'none' }}>← Volver</Link>
      </header>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B6914', marginBottom: '0.5rem' }}>Administración</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '400', color: '#2D5A27' }}>Editar módulo</h1>
        </div>

        <section style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 4px 20px rgba(74,124,63,0.06)' }}>
          <EditModuleForm module={module as any} courses={(courses as any) || []} />
        </section>
      </div>
    </main>
  )
}
