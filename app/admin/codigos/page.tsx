import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/is-admin'
import { createClient } from '@/lib/supabase/server'
import CreateAccessCodeForm from '@/components/admin/CreateAccessCodeForm'

export default async function AdminCodesPage() {
  const { user, isAdmin } = await requireAdmin()
  if (!user) redirect('/login')
  if (!isAdmin) redirect('/dashboard')

  const supabase = await createClient()

  const [{ data: courses }, { data: codes }] = await Promise.all([
    supabase.from('courses').select('id, title').order('title', { ascending: true }),
    supabase.from('access_codes').select(`id, code, course_id, max_uses, uses, active, created_at, courses ( title )`).order('created_at', { ascending: false }),
  ])

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5F2E8 0%, #EDE8D5 100%)', fontFamily: 'Georgia, serif' }}>
      <header style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(74,124,63,0.15)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A7C3F' }}>Admin · Códigos de acceso</span>
        <Link href="/admin" style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.875rem', textDecoration: 'none' }}>← Volver</Link>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B6914', marginBottom: '0.5rem' }}>Administración</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '400', color: '#2D5A27' }}>Códigos de acceso</h1>
          <p style={{ color: '#5C5C4A', fontSize: '0.9rem', marginTop: '0.5rem' }}>Creá códigos para que usuarios accedan a un curso sin pagar.</p>
        </div>

        {/* Crear código */}
        <section style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1.5rem', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 4px 20px rgba(74,124,63,0.06)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '400', color: '#2D5A27', marginBottom: '1.5rem' }}>Crear nuevo código</h2>
          <CreateAccessCodeForm courses={courses || []} />
        </section>

        {/* Lista de códigos */}
        <section>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '400', color: '#2D5A27', marginBottom: '1.5rem' }}>Códigos existentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {codes && codes.length > 0 ? codes.map((c: any) => {
              const courseName = Array.isArray(c.courses) ? c.courses[0]?.title : c.courses?.title
              const usagePercent = c.max_uses > 0 ? Math.round((c.uses / c.max_uses) * 100) : 0
              return (
                <div key={c.id} style={{ background: 'rgba(255,255,255,0.6)', border: `1px solid ${c.active ? 'rgba(74,124,63,0.2)' : 'rgba(0,0,0,0.08)'}`, borderRadius: '1rem', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', opacity: c.active ? 1 : 0.6 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                      <code style={{ fontSize: '1.1rem', fontFamily: 'monospace', color: '#2D5A27', letterSpacing: '0.1em', background: 'rgba(74,124,63,0.08)', padding: '0.2rem 0.6rem', borderRadius: '0.4rem' }}>{c.code}</code>
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: c.active ? 'rgba(74,124,63,0.1)' : 'rgba(0,0,0,0.06)', color: c.active ? '#2D5A27' : '#5C5C4A' }}>
                        {c.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#8B6914', margin: 0 }}>{courseName || 'Sin curso'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.85rem', color: '#5C5C4A', margin: '0 0 0.4rem' }}>
                      {c.uses} / {c.max_uses === 0 ? '∞' : c.max_uses} usos
                    </p>
                    {c.max_uses > 0 && (
                      <div style={{ width: '120px', height: '5px', background: 'rgba(74,124,63,0.12)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#4A7C3F', borderRadius: '999px', width: `${usagePercent}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              )
            }) : (
              <p style={{ color: '#5C5C4A', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>No hay códigos creados todavía.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
