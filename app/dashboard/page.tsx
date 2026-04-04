import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const firstName = profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]

  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select(`id, status, course_id, courses ( id, title, slug, description, cover_image_url )`)
    .eq('user_id', user.id)
    .eq('status', 'active')

  // Para cada curso inscripto, traemos el progreso
  const courseIds = (enrollments || []).map((e: any) => {
    const c = Array.isArray(e.courses) ? e.courses[0] : e.courses
    return c?.id
  }).filter(Boolean)

  // Traemos todas las lecciones de los cursos inscriptos
  const { data: allModules } = courseIds.length > 0
    ? await supabase.from('modules').select('id, course_id').in('course_id', courseIds)
    : { data: [] }

  const moduleIds = (allModules || []).map((m: any) => m.id)

  const { data: allLessons } = moduleIds.length > 0
    ? await supabase.from('lessons').select('id, module_id').in('module_id', moduleIds)
    : { data: [] }

  const { data: progressRows } = allLessons && allLessons.length > 0
    ? await supabase.from('lesson_progress').select('lesson_id, completed, course_id').eq('user_id', user.id).in('course_id', courseIds)
    : { data: [] }

  // Mapa de progreso por curso
  const progressByCourse = new Map<string, { total: number; completed: number }>()
  for (const courseId of courseIds) {
    const courseModuleIds = (allModules || []).filter((m: any) => m.course_id === courseId).map((m: any) => m.id)
    const courseLessons = (allLessons || []).filter((l: any) => courseModuleIds.includes(l.module_id))
    const courseCompleted = (progressRows || []).filter((p: any) => p.course_id === courseId && p.completed).length
    progressByCourse.set(courseId, { total: courseLessons.length, completed: courseCompleted })
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5F2E8 0%, #EDE8D5 100%)', fontFamily: 'Georgia, serif' }}>

      <header style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(74,124,63,0.15)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A7C3F' }}>
          El Arte de Fermentar
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href="/curso" style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.875rem', textDecoration: 'none' }}>Ver cursos</a>
          {isAdmin && (
            <a href="/admin" style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', background: '#8B6914', color: '#F5F2E8', fontSize: '0.875rem', textDecoration: 'none' }}>Panel admin</a>
          )}
          <LogoutButton />
        </div>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>

        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B6914', marginBottom: '0.5rem' }}>Bienvenido de vuelta</p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: '400', color: '#2D5A27', lineHeight: '1.2' }}>
            Hola, <em style={{ fontStyle: 'italic', color: '#8B6914' }}>{firstName}</em>
          </h1>
          <p style={{ color: '#5C5C4A', marginTop: '0.5rem', fontSize: '0.95rem' }}>{user.email}</p>
        </div>

        <div style={{ height: '1px', background: 'rgba(74,124,63,0.15)', marginBottom: '2.5rem' }} />

        <section>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '400', color: '#2D5A27', letterSpacing: '0.02em', marginBottom: '1.5rem' }}>Mis cursos</h2>

          {error && (
            <div style={{ background: 'rgba(180,60,40,0.08)', border: '1px solid rgba(180,60,40,0.2)', borderRadius: '1rem', padding: '1rem 1.25rem', color: '#8B2500', fontSize: '0.875rem' }}>
              Ocurrió un error al cargar tus cursos.
            </div>
          )}

          {!error && enrollments && enrollments.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {enrollments.map((enrollment: any) => {
                const course = Array.isArray(enrollment.courses) ? enrollment.courses[0] : enrollment.courses
                if (!course) return null

                const prog = progressByCourse.get(course.id) || { total: 0, completed: 0 }
                const percent = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0

                return (
                  <div key={enrollment.id} style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 4px 20px rgba(74,124,63,0.06)' }}>
                    {course.cover_image_url ? (
                      <img src={course.cover_image_url} alt={course.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '160px', background: 'linear-gradient(135deg, rgba(74,124,63,0.15), rgba(139,105,20,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '2.5rem', opacity: 0.4 }}>🫙</span>
                      </div>
                    )}

                    <div style={{ padding: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '400', color: '#2D5A27', marginBottom: '0.5rem' }}>{course.title}</h3>
                      <p style={{ fontSize: '0.875rem', color: '#5C5C4A', lineHeight: '1.6', marginBottom: '1rem' }}>
                        {course.description || 'Sin descripción'}
                      </p>

                      {/* Barra de progreso */}
                      {prog.total > 0 && (
                        <div style={{ marginBottom: '1.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#5C5C4A', marginBottom: '0.4rem' }}>
                            <span>Progreso</span>
                            <span style={{ color: percent === 100 ? '#4A7C3F' : '#8B6914' }}>{prog.completed}/{prog.total} · {percent}%</span>
                          </div>
                          <div style={{ height: '7px', background: 'rgba(74,124,63,0.12)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: percent === 100 ? '#4A7C3F' : '#8B6914', borderRadius: '999px', width: `${percent}%`, transition: 'width 0.3s' }} />
                          </div>
                        </div>
                      )}

                      <a href={`/curso/${course.slug}`} style={{ display: 'inline-block', padding: '0.6rem 1.5rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', fontSize: '0.875rem', textDecoration: 'none', letterSpacing: '0.02em' }}>
                        {percent === 100 ? 'Revisar curso →' : percent > 0 ? 'Continuar →' : 'Comenzar →'}
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            !error && (
              <div style={{ background: 'rgba(255,255,255,0.5)', border: '1px dashed rgba(74,124,63,0.3)', borderRadius: '1.25rem', padding: '3rem 2rem', textAlign: 'center' }}>
                <p style={{ color: '#5C5C4A', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Todavía no tenés cursos activos.</p>
                <a href="/curso" style={{ display: 'inline-block', padding: '0.75rem 2rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', fontSize: '0.95rem', textDecoration: 'none', boxShadow: '0 4px 16px rgba(74,124,63,0.2)' }}>
                  Explorar cursos
                </a>
              </div>
            )
          )}
        </section>
      </div>
    </main>
  )
}
