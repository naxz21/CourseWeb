import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function CursosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  let activeCourseIds = new Set<string>()

  if (user) {
    const [{ data: profile }, { data: enrollments }] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).single(),
      supabase.from('enrollments').select('course_id').eq('user_id', user.id).eq('status', 'active'),
    ])
    isAdmin = profile?.role === 'admin'
    activeCourseIds = new Set((enrollments || []).map((item: any) => item.course_id))
  }

  let query = supabase.from('courses').select('*').order('created_at', { ascending: false })
  if (!isAdmin) query = query.eq('published', true)
  const { data: courses, error } = await query

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5F2E8 0%, #EDE8D5 100%)', fontFamily: 'Georgia, serif' }}>
      <style>{`
        .course-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(74,124,63,0.12); }
        .btn-primary:hover { opacity: 0.88; }
        .btn-outline-green:hover { background: #4A7C3F !important; color: #F5F2E8 !important; }
      `}</style>

      {/* Header */}
      <header style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(74,124,63,0.15)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A7C3F' }}>
          El Arte de Fermentar
        </span>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href={user ? '/dashboard' : '/login'} className="btn-outline-green" style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.875rem', textDecoration: 'none', transition: 'all 0.2s' }}>
            ← {user ? 'Dashboard' : 'Iniciar sesión'}
          </Link>
          {isAdmin && (
            <Link href="/admin" style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', background: '#8B6914', color: '#F5F2E8', fontSize: '0.875rem', textDecoration: 'none' }}>
              Panel admin
            </Link>
          )}
        </div>
      </header>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B6914', marginBottom: '0.5rem' }}>
            Catálogo
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '400', color: '#2D5A27' }}>
            Cursos disponibles
          </h1>
          <p style={{ color: '#5C5C4A', marginTop: '0.5rem' }}>
            Explorá los cursos y accedé a los que ya compraste.
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(180,60,40,0.08)', border: '1px solid rgba(180,60,40,0.2)', borderRadius: '1rem', padding: '1rem 1.25rem', color: '#8B2500' }}>
            Ocurrió un error al cargar los cursos.
          </div>
        )}

        {!error && (
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {courses?.map((course: any) => {
              const hasAccess = activeCourseIds.has(course.id)
              return (
                <article
                  key={course.id}
                  className="course-card"
                  style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 4px 20px rgba(74,124,63,0.06)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                >
                  {course.cover_image_url ? (
                    <img src={course.cover_image_url} alt={course.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '180px', background: 'linear-gradient(135deg, rgba(74,124,63,0.15), rgba(139,105,20,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '3rem', opacity: 0.3 }}>🫙</span>
                    </div>
                  )}
                  <div style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '400', color: '#2D5A27', marginBottom: '0.5rem' }}>{course.title}</h2>
                    <p style={{ fontSize: '0.875rem', color: '#5C5C4A', lineHeight: '1.6', marginBottom: '1rem' }}>{course.description || 'Sin descripción'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: '400', color: '#2D5A27' }}>${course.price}</span>
                      {!course.published && (
                        <span style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8B6914', background: 'rgba(139,105,20,0.1)', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>Borrador</span>
                      )}
                    </div>
                    <Link
                      href={user ? `/curso/${course.slug}` : '/login'}
                      className="btn-primary"
                      style={{ display: 'inline-block', padding: '0.6rem 1.5rem', borderRadius: '999px', background: hasAccess ? '#4A7C3F' : '#2D5A27', color: '#F5F2E8', fontSize: '0.875rem', textDecoration: 'none', transition: 'opacity 0.2s' }}
                    >
                      {hasAccess ? 'Entrar al curso →' : 'Explorar curso'}
                    </Link>
                  </div>
                </article>
              )
            })}
            {courses?.length === 0 && (
              <div style={{ background: 'rgba(255,255,255,0.5)', border: '1px dashed rgba(74,124,63,0.3)', borderRadius: '1.25rem', padding: '3rem 2rem', textAlign: 'center', color: '#5C5C4A' }}>
                No hay cursos disponibles por ahora.
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  )
}
