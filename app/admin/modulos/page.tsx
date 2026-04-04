import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/is-admin'
import { createClient } from '@/lib/supabase/server'
import CreateModuleForm from '@/components/admin/CreateModuleForm'
import ModuleAccordion from '@/components/admin/ModuleAccordion'

export default async function AdminModulosPage() {
  const { user, isAdmin } = await requireAdmin()
  if (!user) redirect('/login')
  if (!isAdmin) redirect('/dashboard')

  const supabase = await createClient()

  const [{ data: courses }, { data: modules }, { data: lessons }] = await Promise.all([
    supabase.from('courses').select('id, title, slug').order('title', { ascending: true }),
    supabase.from('modules').select('id, title, description, position, course_id').order('course_id', { ascending: true }).order('position', { ascending: true }),
    supabase.from('lessons').select('id, title, position, module_id, cover_image_url, lesson_type').order('position', { ascending: true }),
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
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '400', color: '#2D5A27' }}>Módulos y lecciones</h1>
          <p style={{ color: '#5C5C4A', fontSize: '0.9rem', marginTop: '0.5rem' }}>Expandí cada módulo para ver, crear y editar sus lecciones.</p>
        </div>

        {/* Cursos con módulos */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {courses?.map((course: any) => {
              const courseModules = (modules || [])
                .filter((m: any) => m.course_id === course.id)
                .sort((a: any, b: any) => a.position - b.position)

              return (
                <div key={course.id} style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 2px 12px rgba(74,124,63,0.06)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '400', color: '#2D5A27', marginBottom: '0.25rem' }}>{course.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#8B6914', marginBottom: '1.25rem' }}>/{course.slug}</p>

                  {courseModules.length === 0 ? (
                    <p style={{ fontSize: '0.875rem', color: '#5C5C4A', fontStyle: 'italic', padding: '1rem', border: '1px dashed rgba(74,124,63,0.2)', borderRadius: '0.75rem', textAlign: 'center' }}>
                      Este curso no tiene módulos todavía.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {courseModules.map((module: any) => {
                        const moduleLessons = (lessons || [])
                          .filter((l: any) => l.module_id === module.id)
                          .sort((a: any, b: any) => a.position - b.position)
                        return <ModuleAccordion key={module.id} module={module} lessons={moduleLessons} />
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Crear módulo — al final */}
        <section style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 4px 20px rgba(74,124,63,0.06)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '400', color: '#2D5A27', marginBottom: '1.5rem' }}>Crear nuevo módulo</h2>
          <CreateModuleForm courses={(courses as any) || []} existingModules={(modules as any) || []} />
        </section>
      </div>
    </main>
  )
}
