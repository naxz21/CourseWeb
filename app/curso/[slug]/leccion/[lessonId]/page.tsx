import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import LessonProgressControls from '@/components/LessonProgressControls'
import { buildGDrivePreviewUrl } from '@/lib/gdrive'
import MuxPlayerWrapper from '@/components/MuxPlayerWrapper'

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>
}) {
  const { slug, lessonId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('id, title, slug')
    .eq('slug', slug)
    .maybeSingle()

  if (!course) return (
    <main style={{ minHeight: '100vh', background: '#F5F2E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', color: '#2D5A27' }}>
      Curso no encontrado
    </main>
  )

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!enrollment) {
    return (
      <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5F2E8 0%, #EDE8D5 100%)', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: 'rgba(139,105,20,0.08)', border: '1px solid rgba(139,105,20,0.2)', borderRadius: '1.25rem', padding: '2rem', maxWidth: '480px', textAlign: 'center' }}>
          <p style={{ color: '#8B6914', marginBottom: '1.5rem' }}>Tenés que comprar el curso para acceder a esta lección.</p>
          <Link href={`/curso/${slug}`} style={{ padding: '0.75rem 1.75rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', textDecoration: 'none', fontSize: '0.9rem' }}>
            Volver al curso
          </Link>
        </div>
      </main>
    )
  }

  const { data: lesson } = await supabaseAdmin
    .from('lessons')
    .select('id, module_id, title, content, position, cover_image_url')
    .eq('id', lessonId)
    .maybeSingle()

  if (!lesson) return (
    <main style={{ padding: '3rem', fontFamily: 'Georgia, serif', color: '#2D5A27' }}>Lección no encontrada</main>
  )

  const { data: moduleData } = await supabaseAdmin
    .from('modules')
    .select('id, title, course_id, position')
    .eq('id', lesson.module_id)
    .maybeSingle()

  if (!moduleData || moduleData.course_id !== course.id) notFound()

  const { data: modules } = await supabaseAdmin
    .from('modules')
    .select('id, title, position')
    .eq('course_id', course.id)
    .order('position', { ascending: true })

  const moduleIds = (modules || []).map((m) => m.id)

  const { data: allLessons } = await supabaseAdmin
    .from('lessons')
    .select('id, module_id, title, position, cover_image_url')
    .in('module_id', moduleIds.length > 0 ? moduleIds : ['00000000-0000-0000-0000-000000000000'])
    .order('position', { ascending: true })

  const orderedLessons = modules?.flatMap((module) =>
    (allLessons || [])
      .filter((l) => l.module_id === module.id)
      .sort((a, b) => a.position - b.position)
      .map((l) => ({ ...l, moduleTitle: module.title, modulePosition: module.position }))
  ) || []

  const currentIndex = orderedLessons.findIndex((l) => l.id === lesson.id)
  const previousLesson = currentIndex > 0 ? orderedLessons[currentIndex - 1] : null
  const nextLesson = currentIndex >= 0 && currentIndex < orderedLessons.length - 1 ? orderedLessons[currentIndex + 1] : null

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_id, completed, last_viewed_at')
    .eq('user_id', user.id)
    .eq('course_id', course.id)

  const progressMap = new Map((progress || []).map((item) => [item.lesson_id, item]))
  const isCompleted = !!progressMap.get(lesson.id)?.completed
  const totalLessons = orderedLessons.length
  const completedLessons = orderedLessons.filter((item) => progressMap.get(item.id)?.completed).length
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const { data: assets } = await supabaseAdmin
    .from('lesson_assets')
    .select('id, asset_type, title, file_url, position, provider, provider_file_id')
    .eq('lesson_id', lesson.id)
    .order('position', { ascending: true })

  const safeAssets = assets || []
  const pdfs = safeAssets.filter((a: any) => a.asset_type === 'pdf')
  const videos = safeAssets.filter((a: any) => a.asset_type === 'video')
  const images = safeAssets.filter((a: any) => a.asset_type === 'image')

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5F2E8 0%, #EDE8D5 100%)', fontFamily: 'Georgia, serif' }}>

      <header style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(74,124,63,0.15)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <Link href={`/curso/${slug}`} style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.875rem', textDecoration: 'none' }}>
          ← Volver al curso
        </Link>
        <div style={{ fontSize: '0.8rem', color: '#5C5C4A', background: 'rgba(74,124,63,0.08)', padding: '0.4rem 1rem', borderRadius: '999px' }}>
          {completedLessons}/{totalLessons} · {progressPercent}%
        </div>
      </header>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Lección principal */}
        <section style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 4px 20px rgba(74,124,63,0.06)' }}>
          {lesson.cover_image_url && (
            <img src={lesson.cover_image_url} alt={lesson.title} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
          )}
          <div style={{ padding: '2rem' }}>
            <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8B6914', marginBottom: '0.5rem' }}>
              {moduleData.title}
            </p>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '400', color: '#2D5A27', marginBottom: '1.25rem' }}>
              {lesson.title}
            </h1>
            <div style={{ height: '6px', background: 'rgba(74,124,63,0.15)', borderRadius: '999px', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ height: '100%', background: '#4A7C3F', borderRadius: '999px', width: `${progressPercent}%` }} />
            </div>
            {lesson.content && (
              <p style={{ color: '#5C5C4A', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{lesson.content}</p>
            )}
          </div>
        </section>

        {/* ── VIDEOS ── bifurcación Mux vs legacy ── */}
        {videos.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '400', color: '#2D5A27' }}>Videos</h2>
            {videos.map((v: any) => {
              const isMux = v.provider === 'mux'

              // ── Video Mux (streaming HLS) ──────────────────────────────────
              if (isMux) {
                // file_url guarda el playback_id cuando provider = 'mux'
                const playbackId = v.file_url || v.provider_file_id

                if (!playbackId) {
                  return (
                    <div key={v.id} style={cardStyle}>
                      <p style={{ fontSize: '0.875rem', color: '#8B2500' }}>
                        ⚠ Este video todavía está procesándose o tiene un error.
                      </p>
                    </div>
                  )
                }

                return (
                  <div key={v.id} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <p style={{ fontSize: '0.875rem', color: '#2D5A27', margin: 0 }}>{v.title || 'Video'}</p>
                      <span style={{ fontSize: '0.7rem', color: '#4A7C3F', background: 'rgba(74,124,63,0.1)', padding: '0.2rem 0.6rem', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                        ▶ Mux Stream
                      </span>
                    </div>

                    <MuxPlayerWrapper playbackId={playbackId} title={v.title} />

                  </div>
                )
              }

              // ── Video legacy (archivo directo) ─────────────────────────────
              return (
                <div key={v.id} style={cardStyle}>
                  <p style={{ fontSize: '0.875rem', color: '#2D5A27', marginBottom: '0.75rem' }}>{v.title || 'Video'}</p>
                  <video controls style={{ width: '100%', borderRadius: '0.75rem' }} src={v.file_url} />
                </div>
              )
            })}
          </section>
        )}

        {/* PDFs — sin cambios */}
        {pdfs.length > 0 && (
           <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <h2 style={{ fontSize: '1.1rem', fontWeight: '400', color: '#2D5A27' }}>PDFs</h2>
             {pdfs.map((p: any) => {
               const isGdrive = p.provider === 'gdrive'

               if (isGdrive) {
                 const hasFileId = !!p.provider_file_id
                 const previewUrl = hasFileId ? buildGDrivePreviewUrl(p.provider_file_id) : null

                 return (
                   <div key={p.id} style={cardStyle}>
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                       <p style={{ fontSize: '0.875rem', color: '#2D5A27', margin: 0 }}>{p.title || 'PDF'}</p>
                       <span style={{ fontSize: '0.7rem', color: '#1A56A4', background: 'rgba(26,86,164,0.1)', padding: '0.2rem 0.6rem', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                         ☁ Google Drive
                       </span>
                     </div>

                     {hasFileId && previewUrl ? (
                       <>
                         <div style={{ marginBottom: '1rem' }}>
                           <a
                             href={`https://drive.google.com/file/d/${p.provider_file_id}/view`}
                             target="_blank"
                             rel="noopener noreferrer"
                             style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block' }}
                           >
                             Abrir en Google Drive ↗
                           </a>
                         </div>
<div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(74,124,63,0.15)', background: 'rgba(245,242,232,0.5)' }}>
                            <iframe src={previewUrl} className="pdf-iframe" title={p.title || 'PDF'} allow="autoplay" />
                          </div>
                       </>
                     ) : (
                       <div style={{ background: 'rgba(180,60,40,0.06)', border: '1px solid rgba(180,60,40,0.15)', borderRadius: '0.75rem', padding: '1rem', fontSize: '0.875rem', color: '#8B2500' }}>
                         No se pudo cargar el PDF.
                       </div>
                     )}
                   </div>
                 )
               }

               return (
                 <div key={p.id} style={cardStyle}>
                   <p style={{ fontSize: '0.875rem', color: '#2D5A27', marginBottom: '0.75rem' }}>{p.title || 'PDF'}</p>
                   <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                     <a href={p.file_url} target="_blank" rel="noopener noreferrer" style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', fontSize: '0.875rem', textDecoration: 'none' }}>
                       Abrir PDF
                     </a>
                     <a href={p.file_url} download style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.875rem', textDecoration: 'none' }}>
                       Descargar
                     </a>
                   </div>
<div style={{ borderRadius: '0.75rem', overflow: 'hidden', border: '1px solid rgba(74,124,63,0.15)' }}>
                      <iframe src={p.file_url} className="pdf-iframe" title={p.title || 'PDF'} />
                   </div>
                 </div>
               )
             })}
           </section>
         )}

        {/* Imágenes — sin cambios */}
        {images.length > 0 && (
          <section>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '400', color: '#2D5A27', marginBottom: '1rem' }}>Imágenes</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {images.map((img: any) => (
                <div key={img.id} style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1rem', padding: '0.75rem' }}>
                  <p style={{ fontSize: '0.8rem', color: '#2D5A27', marginBottom: '0.5rem' }}>{img.title || 'Imagen'}</p>
                  <img src={img.file_url} alt={img.title || lesson.title} style={{ width: '100%', borderRadius: '0.75rem' }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {safeAssets.length === 0 && (
          <section style={{ background: 'rgba(255,255,255,0.4)', border: '1px dashed rgba(74,124,63,0.2)', borderRadius: '1.25rem', padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#5C5C4A', fontStyle: 'italic' }}>Esta lección todavía no tiene archivos cargados.</p>
          </section>
        )}



        {/* ── Índice de Contenido — acordeón por módulo ── */}
        {modules && modules.length > 0 && (
          <section style={{ borderRadius: '1.25rem', overflow: 'hidden', border: '1px solid rgba(74,124,63,0.15)' }}>
            <style>{`
              .accordion-summary {
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
              .accordion-summary:hover { background: rgba(74,124,63,0.06); }
              .accordion-summary::-webkit-details-marker { display: none; }
              details[open] .accordion-summary { background: rgba(74,124,63,0.07); }
              .accordion-chevron { transition: transform 0.2s; font-style: normal; font-size: 0.7rem; color: #4A7C3F; }
              details[open] .accordion-chevron { transform: rotate(180deg); }
              .index-lesson-row { transition: background 0.12s; }
              .index-lesson-row:hover { background: rgba(74,124,63,0.07) !important; }
            `}</style>

            {/* Cabecera del índice */}
            <div style={{ padding: '1rem 1.25rem', background: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(74,124,63,0.12)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A7C3F' }}>Contenido del curso</span>
              <span style={{ fontSize: '0.7rem', color: '#5C5C4A', marginLeft: 'auto' }}>{completedLessons}/{totalLessons} completadas</span>
            </div>

            {/* Un <details> por módulo */}
            {modules.map((module, moduleIndex) => {
              const moduleLessons = orderedLessons.filter((l) => l.module_id === module.id)
              const hasCurrentLesson = moduleLessons.some((l) => l.id === lessonId)
              const moduleCompleted = moduleLessons.filter((l) => progressMap.get(l.id)?.completed).length

              return (
                <details key={module.id} open={hasCurrentLesson || moduleIndex === 0}>
                  <summary className="accordion-summary">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.65rem', color: '#8B6914', letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>
                        {moduleIndex + 1}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: '#2D5A27', fontWeight: hasCurrentLesson ? '600' : '400', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {module.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.7rem', color: '#5C5C4A' }}>{moduleCompleted}/{moduleLessons.length}</span>
                      <em className="accordion-chevron">▾</em>
                    </div>
                  </summary>

                  {/* Lecciones del módulo */}
                  <div style={{ background: 'rgba(245,242,232,0.4)' }}>
                    {moduleLessons.map((l, lessonIdx) => {
                      const lCompleted = !!progressMap.get(l.id)?.completed
                      const isCurrent = l.id === lessonId
                      return (
                        <Link
                          key={l.id}
                          href={`/curso/${slug}/leccion/${l.id}`}
                          className="index-lesson-row"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.6rem 1.25rem 0.6rem 2.25rem',
                            borderBottom: lessonIdx < moduleLessons.length - 1 ? '1px solid rgba(74,124,63,0.07)' : 'none',
                            background: isCurrent ? 'rgba(74,124,63,0.1)' : 'transparent',
                            textDecoration: 'none',
                          }}
                        >
                          {/* Indicador de estado */}
                          <span style={{ fontSize: '0.7rem', flexShrink: 0, color: lCompleted ? '#4A7C3F' : isCurrent ? '#4A7C3F' : 'rgba(74,124,63,0.3)', lineHeight: 1 }}>
                            {lCompleted ? '✓' : isCurrent ? '▶' : '○'}
                          </span>

                          {/* Título */}
                          <span style={{ flex: 1, fontSize: '0.825rem', color: isCurrent ? '#2D5A27' : lCompleted ? '#4A7C3F' : '#5C5C4A', fontWeight: isCurrent ? '600' : '400', lineHeight: '1.3' }}>
                            {l.title}
                          </span>

                          {/* Badge "Actual" solo para la lección activa */}
                          {isCurrent && (
                            <span style={{ fontSize: '0.6rem', padding: '0.1rem 0.45rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', flexShrink: 0 }}>
                              Actual
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

        {/* Botón marcar como completada — al final de todo */}
        <LessonProgressControls
          courseId={course.id}
          moduleId={lesson.module_id}
          lessonId={lesson.id}
          initialCompleted={isCompleted}
        />

      </div>
    </main>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.6)',
  border: '1px solid rgba(74,124,63,0.2)',
  borderRadius: '1.25rem',
  padding: '1.25rem',
  boxShadow: '0 2px 12px rgba(74,124,63,0.04)',
}
