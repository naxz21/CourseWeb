import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/is-admin'
import { createClient } from '@/lib/supabase/server'
import CreateCourseForm from '@/components/admin/CreateCourseForm'
import DeleteCourseButton from '@/components/admin/DeleteCourseButton'

export default async function AdminCursosPage() {
  const { user, isAdmin } = await requireAdmin()
  if (!user) redirect('/login')
  if (!isAdmin) redirect('/dashboard')

  const supabase = await createClient()
  const { data: courses } = await supabase.from('courses').select('*').order('created_at', { ascending: false })

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5F2E8 0%, #EDE8D5 100%)', fontFamily: 'Georgia, serif' }}>
      <header style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(74,124,63,0.15)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A7C3F' }}>Admin · Cursos</span>
        <Link href="/admin" style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.875rem', textDecoration: 'none' }}>← Volver</Link>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B6914', marginBottom: '0.5rem' }}>Administración</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '400', color: '#2D5A27' }}>Cursos</h1>
        </div>

        {/* Crear curso */}
        <section style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1.5rem', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 4px 20px rgba(74,124,63,0.06)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '400', color: '#2D5A27', marginBottom: '1.5rem', letterSpacing: '0.02em' }}>Crear nuevo curso</h2>
          <CreateCourseForm />
        </section>

        {/* Cursos existentes */}
        <section>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '400', color: '#2D5A27', marginBottom: '1.5rem' }}>Cursos existentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {courses?.map((course: any) => (
              <div key={course.id} style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1.25rem', overflow: 'hidden', display: 'flex', gap: '0', boxShadow: '0 2px 12px rgba(74,124,63,0.06)' }}>
                {course.cover_image_url && (
                  <img src={course.cover_image_url} alt={course.title} style={{ width: '120px', minWidth: '120px', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '1.5rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '400', color: '#2D5A27', marginBottom: '0.25rem' }}>{course.title}</h3>
                      <p style={{ fontSize: '0.8rem', color: '#8B6914' }}>/{course.slug}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.75rem', borderRadius: '999px', background: course.published ? 'rgba(74,124,63,0.1)' : 'rgba(139,105,20,0.1)', color: course.published ? '#2D5A27' : '#8B6914', letterSpacing: '0.05em' }}>
                        {course.published ? 'Publicado' : 'Borrador'}
                      </span>
                      <span style={{ fontSize: '1rem', fontWeight: '400', color: '#2D5A27' }}>${course.price}</span>
                    </div>
                  </div>
                  {course.description && <p style={{ fontSize: '0.875rem', color: '#5C5C4A', marginTop: '0.75rem', lineHeight: '1.5' }}>{course.description}</p>}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                    <Link href={`/admin/cursos/${course.id}`} style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.875rem', textDecoration: 'none' }}>Editar</Link>
                    <DeleteCourseButton courseId={course.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
