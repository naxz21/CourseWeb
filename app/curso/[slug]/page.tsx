import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BuyButton from '@/components/BuyButton'
import RedeemCodeButton from '@/components/RedeemCodeButton'

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: course, error: courseError } = await supabase.from('courses').select('*').eq('slug', slug).single()
  if (courseError || !course) return <main style={{ minHeight: '100vh', background: '#F5F2E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', color: '#2D5A27' }}>Curso no encontrado</main>

  const { data: enrollment } = await supabase.from('enrollments').select('*').eq('user_id', user.id).eq('course_id', course.id).eq('status', 'active').maybeSingle()
  const { data: modules } = await supabase.from('modules').select(`id, title, description, position, lessons ( id, title, content, position, cover_image_url )`).eq('course_id', course.id).order('position', { ascending: true })

  const hasAccess = !!enrollment

  let progressMap = new Map<string, { lesson_id: string; completed: boolean; last_viewed_at: string | null }>()
  if (hasAccess) {
    const { data: progressRows } = await supabase.from('lesson_progress').select('lesson_id, completed, last_viewed_at').eq('user_id', user.id).eq('course_id', course.id)
    progressMap = new Map((progressRows || []).map((item: any) => [item.lesson_id, item]))
  }

  const safeModules = [...(modules || [])].sort((a: any, b: any) => a.position - b.position)
  const flatLessons = safeModules.flatMap((module: any) =>
    [...(module.lessons || [])].sort((a: any, b: any) => a.position - b.position).map((lesson: any) => ({ ...lesson, moduleId: module.id, moduleTitle: module.title, modulePosition: module.position }))
  )

  // Acceso libre — todas las lecciones desbloqueadas si el usuario tiene acceso al curso
  const unlockedLessonIds = hasAccess
    ? new Set(flatLessons.map((lesson: any) => lesson.id))
    : new Set<string>()

  const totalLessons = flatLessons.length
  const completedLessons = flatLessons.filter((l: any) => progressMap.get(l.id)?.completed).length
  const courseProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const continueLesson =
    flatLessons.find((l: any) => { const r = progressMap.get(l.id); return !!r?.last_viewed_at && !r?.completed }) ||
    flatLessons.find((l: any) => !progressMap.get(l.id)?.completed) ||
    flatLessons[0]

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5F2E8 0%, #EDE8D5 100%)', fontFamily: 'Georgia, serif' }}>
      <style>{`
        .lesson-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(74,124,63,0.1); }
        .index-row { transition: background 0.15s, box-shadow 0.15s; }
        .index-row:hover { background: rgba(74,124,63,0.1) !important; box-shadow: 0 2px 8px rgba(74,124,63,0.08); }
      `}</style>

      <header style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(74,124,63,0.15)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A7C3F' }}>El Arte de Fermentar</span>
        <Link href="/dashboard" style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.875rem', textDecoration: 'none' }}>← Dashboard</Link>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Hero del curso */}
        <section style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 4px 20px rgba(74,124,63,0.06)' }}>
          {course.cover_image_url && (
            <img src={course.cover_image_url} alt={course.title} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
          )}
          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B6914', marginBottom: '0.5rem' }}>Curso</p>
                <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '400', color: '#2D5A27', lineHeight: '1.2' }}>{course.title}</h1>
                {course.description && <p style={{ color: '#5C5C4A', marginTop: '0.75rem', lineHeight: '1.7' }}>{course.description}</p>}
                {hasAccess && totalLessons > 0 && (
                  <div style={{ marginTop: '1.5rem', maxWidth: '400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#5C5C4A', marginBottom: '0.5rem' }}>
                      <span>Progreso</span>
                      <span>{completedLessons}/{totalLessons} · {courseProgress}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(74,124,63,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#4A7C3F', borderRadius: '999px', width: `${courseProgress}%`, transition: 'width 0.3s' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acceso cuando no tiene el curso */}
              {!hasAccess && (
                <div className="course-hero-buttons">
                  <BuyButton courseId={course.id} title={course.title} price={course.price} userEmail={user.email ?? ''} userId={user.id} />
                  <RedeemCodeButton courseId={course.id} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Índice de contenido — acordeón por módulo */}
        {hasAccess && safeModules.length > 0 && (
          <section style={{ borderRadius: '1.25rem', overflow: 'hidden', border: '1px solid rgba(74,124,63,0.15)' }}>
            <style>{`
              .ci-summary {
                list-style: none;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0.9rem 1.25rem;
                cursor: pointer;
                user-select: none;
                background: rgba(255,255,255,0.55);
                border-bottom: 1px solid rgba(74,124,63,0.1);
                font-family: Georgia, serif;
                transition: background 0.15s;
              }
              .ci-summary:hover { background: rgba(74,124,63,0.06); }
              .ci-summary::-webkit-details-marker { display: none; }
              details[open] .ci-summary { background: rgba(74,124,63,0.07); }
              .ci-chevron { transition: transform 0.2s; font-style: normal; font-size: 0.7rem; color: #4A7C3F; }
              details[open] .ci-chevron { transform: rotate(180deg); }
              .ci-row { transition: background 0.12s; }
              .ci-row:hover { background: rgba(74,124,63,0.07) !important; }
            `}</style>

            {/* Cabecera */}
            <div style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(74,124,63,0.12)', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A7C3F' }}>Contenido del curso</span>
              <span style={{ fontSize: '0.7rem', color: '#5C5C4A', marginLeft: 'auto' }}>{completedLessons}/{totalLessons} completadas</span>
            </div>

            {safeModules.map((module: any, moduleIndex: number) => {
              const moduleLessons = [...(module.lessons || [])].sort((a: any, b: any) => a.position - b.position)
              const moduleCompleted = moduleLessons.filter((l: any) => progressMap.get(l.id)?.completed).length
              const hasInProgress = moduleLessons.some((l: any) => {
                const p = progressMap.get(l.id)
                return !!p?.last_viewed_at && !p?.completed
              })

              return (
                <details key={module.id} open={moduleIndex === 0 || hasInProgress}>
                  <summary className="ci-summary">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.65rem', color: '#8B6914', letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>
                        {moduleIndex + 1}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: '#2D5A27', fontWeight: hasInProgress ? '600' : '400', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {module.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.7rem', color: '#5C5C4A' }}>{moduleCompleted}/{moduleLessons.length}</span>
                      <em className="ci-chevron">▾</em>
                    </div>
                  </summary>

                  <div style={{ background: 'rgba(245,242,232,0.4)' }}>
                    {moduleLessons.map((lesson: any, lessonIdx: number) => {
                      const completed = !!progressMap.get(lesson.id)?.completed
                      const inProgress = !!progressMap.get(lesson.id)?.last_viewed_at && !completed
                      return (
                        <Link
                          key={lesson.id}
                          href={`/curso/${slug}/leccion/${lesson.id}`}
                          className="ci-row"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.6rem 1.25rem 0.6rem 2.25rem',
                            borderBottom: lessonIdx < moduleLessons.length - 1 ? '1px solid rgba(74,124,63,0.07)' : 'none',
                            background: inProgress ? 'rgba(139,105,20,0.05)' : 'transparent',
                            textDecoration: 'none',
                          }}
                        >
                          <span style={{ fontSize: '0.7rem', flexShrink: 0, color: completed ? '#4A7C3F' : inProgress ? '#8B6914' : 'rgba(74,124,63,0.3)', lineHeight: 1 }}>
                            {completed ? '✓' : inProgress ? '▶' : '○'}
                          </span>
                          <span style={{ flex: 1, fontSize: '0.825rem', color: completed ? '#4A7C3F' : inProgress ? '#8B6914' : '#5C5C4A', fontWeight: inProgress ? '500' : '400', lineHeight: '1.3' }}>
                            {lesson.title}
                          </span>
                          {inProgress && (
                            <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.45rem', borderRadius: '999px', background: 'rgba(139,105,20,0.15)', color: '#8B6914', flexShrink: 0 }}>
                              En progreso
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </details>
              )
            })}
          </section>
        )}

        {/* Continuar */}
        {hasAccess && continueLesson && (
          <section style={{ background: 'rgba(74,124,63,0.08)', border: '1px solid rgba(74,124,63,0.25)', borderRadius: '1.25rem', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A7C3F', marginBottom: '0.25rem' }}>Continuar donde lo dejaste</p>
              <p style={{ fontSize: '0.85rem', color: '#5C5C4A' }}>{continueLesson.moduleTitle}</p>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '400', color: '#2D5A27' }}>{continueLesson.title}</h2>
            </div>
            <Link href={`/curso/${slug}/leccion/${continueLesson.id}`} style={{ padding: '0.75rem 1.75rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', textDecoration: 'none', fontSize: '0.9rem', flexShrink: 0 }}>
              Continuar →
            </Link>
          </section>
        )}

        {/* Acceso bloqueado */}
        {!hasAccess && (
          <section style={{ background: 'rgba(139,105,20,0.06)', border: '1px solid rgba(139,105,20,0.2)', borderRadius: '1.25rem', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '400', color: '#8B6914', marginBottom: '0.5rem' }}>Acceso bloqueado</h2>
            <p style={{ color: '#5C5C4A', fontSize: '0.9rem' }}>Comprá el curso o ingresá un código de acceso para ver las lecciones.</p>
          </section>
        )}

        {/* Módulos y lecciones */}
        {hasAccess && safeModules.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {safeModules.map((module: any, moduleIndex: number) => {
              const moduleLessons = [...(module.lessons || [])].sort((a: any, b: any) => a.position - b.position)
              const moduleCompleted = moduleLessons.filter((l: any) => progressMap.get(l.id)?.completed).length
              const moduleProgress = moduleLessons.length > 0 ? Math.round((moduleCompleted / moduleLessons.length) * 100) : 0

              return (
                <section key={module.id} style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1.25rem', padding: '1.75rem', boxShadow: '0 2px 12px rgba(74,124,63,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8B6914', marginBottom: '0.25rem' }}>Módulo {moduleIndex + 1}</p>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: '400', color: '#2D5A27' }}>{module.title}</h2>
                      {module.description && <p style={{ fontSize: '0.875rem', color: '#5C5C4A', marginTop: '0.25rem' }}>{module.description}</p>}
                    </div>
                    <div style={{ minWidth: '160px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#5C5C4A', marginBottom: '0.4rem' }}>
                        <span>Progreso</span><span>{moduleCompleted}/{moduleLessons.length} · {moduleProgress}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(74,124,63,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: '#4A7C3F', borderRadius: '999px', width: `${moduleProgress}%` }} />
                      </div>
                    </div>
                  </div>

                  {moduleLessons.length > 0 ? (
                    <div className="lessons-grid">
                      {moduleLessons.map((lesson: any) => {
                        const completed = !!progressMap.get(lesson.id)?.completed
                        return (
                          <div key={lesson.id} className="lesson-card" style={{ background: completed ? 'rgba(74,124,63,0.06)' : 'rgba(245,242,232,0.8)', border: `1px solid ${completed ? 'rgba(74,124,63,0.25)' : 'rgba(74,124,63,0.15)'}`, borderRadius: '1rem', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                            {lesson.cover_image_url ? (
                              <img src={lesson.cover_image_url} alt={lesson.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '140px', background: 'linear-gradient(135deg, rgba(74,124,63,0.1), rgba(139,105,20,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '2rem', opacity: 0.3 }}>📖</span>
                              </div>
                            )}
                            <div style={{ padding: '1rem' }}>
                              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                {completed && <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(74,124,63,0.15)', color: '#2D5A27' }}>✓ Completada</span>}
                                {!completed && <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(139,105,20,0.1)', color: '#8B6914' }}>Disponible</span>}
                              </div>
                              <h3 style={{ fontSize: '0.95rem', fontWeight: '400', color: '#2D5A27', marginBottom: '0.75rem', lineHeight: '1.4' }}>{lesson.title}</h3>
                              <Link href={`/curso/${slug}/leccion/${lesson.id}`} style={{ display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '999px', background: completed ? 'rgba(74,124,63,0.15)' : '#4A7C3F', color: completed ? '#2D5A27' : '#F5F2E8', fontSize: '0.8rem', textDecoration: 'none' }}>
                                {completed ? 'Revisar' : 'Ver lección →'}
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p style={{ color: '#5C5C4A', fontStyle: 'italic', fontSize: '0.875rem' }}>Este módulo todavía no tiene lecciones.</p>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
