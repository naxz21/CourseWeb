import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/is-admin'
import { createClient } from '@/lib/supabase/server'
import CreateModuleForm from '@/components/admin/CreateModuleForm'
import DeleteModuleButton from '@/components/admin/DeleteModuleButton'
import MoveModuleButtons from '@/components/admin/MoveModuleButtons'

export default async function AdminModulosPage() {
  const { user, isAdmin } = await requireAdmin()
  if (!user) redirect('/login')
  if (!isAdmin) redirect('/dashboard')

  const supabase = await createClient()
  const [{ data: courses }, { data: modules }] = await Promise.all([
    supabase.from('courses').select('id, title, slug').order('title', { ascending: true }),
    supabase.from('modules').select(`id, title, description, position, course_id, courses ( id, title )`).order('course_id', { ascending: true }).order('position', { ascending: true }),
  ])

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5F2E8 0%, #EDE8D5 100%)', fontFamily: 'Georgia, serif' }}>
      <header style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(74,124,63,0.15)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A7C3F' }}>Admin · Módulos</span>
        <Link href="/admin" style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.875rem', textDecoration: 'none' }}>← Volver</Link>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B6914', marginBottom: '0.5rem' }}>Administración</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '400', color: '#2D5A27' }}>Módulos</h1>
        </div>

        <section style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1.5rem', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 4px 20px rgba(74,124,63,0.06)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '400', color: '#2D5A27', marginBottom: '1.5rem' }}>Crear nuevo módulo</h2>
          <CreateModuleForm courses={(courses as any) || []} existingModules={(modules as any) || []} />
        </section>

        <section>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '400', color: '#2D5A27', marginBottom: '1.5rem' }}>Módulos por curso</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {courses?.map((course: any) => {
              const courseModules = (modules || []).filter((m: any) => m.course_id === course.id).sort((a: any, b: any) => a.position - b.position)
              return (
                <div key={course.id} style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 2px 12px rgba(74,124,63,0.06)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '400', color: '#2D5A27', marginBottom: '0.25rem' }}>{course.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#8B6914', marginBottom: '1.25rem' }}>/{course.slug}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {courseModules.length === 0 && (
                      <p style={{ fontSize: '0.875rem', color: '#5C5C4A', fontStyle: 'italic', padding: '1rem', border: '1px dashed rgba(74,124,63,0.2)', borderRadius: '0.75rem', textAlign: 'center' }}>
                        Este curso no tiene módulos todavía.
                      </p>
                    )}
                    {courseModules.map((module: any) => (
                      <div key={module.id} style={{ background: 'rgba(245,242,232,0.8)', border: '1px solid rgba(74,124,63,0.15)', borderRadius: '1rem', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <div>
                          <p style={{ fontSize: '0.7rem', color: '#8B6914', marginBottom: '0.25rem' }}>Módulo {module.position}</p>
                          <h4 style={{ fontSize: '1rem', fontWeight: '400', color: '#2D5A27' }}>{module.title}</h4>
                          {module.description && <p style={{ fontSize: '0.85rem', color: '#5C5C4A', marginTop: '0.25rem' }}>{module.description}</p>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <MoveModuleButtons moduleId={module.id} />
                          <Link href={`/admin/modulos/${module.id}`} style={{ padding: '0.4rem 1rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.8rem', textDecoration: 'none' }}>Editar</Link>
                          <DeleteModuleButton moduleId={module.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
