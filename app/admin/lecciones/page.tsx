import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CreateLessonForm from '@/components/admin/CreateLessonForm'
import DeleteLessonButton from '@/components/admin/DeleteLessonButton'

export default async function AdminLessonsPage() {
  const supabase = await createClient()

  const { data: modules } = await supabase.from('modules').select(`id, title, position, courses ( title )`).order('position', { ascending: true })
  const { data: lessons } = await supabase.from('lessons').select(`id, title, lesson_type, content, position, module_id, cover_image_url, modules ( id, title )`).order('module_id', { ascending: true }).order('position', { ascending: true })

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5F2E8 0%, #EDE8D5 100%)', fontFamily: 'Georgia, serif' }}>
      <header style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(74,124,63,0.15)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A7C3F' }}>Admin · Lecciones</span>
        <Link href="/admin" style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.875rem', textDecoration: 'none' }}>← Volver</Link>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B6914', marginBottom: '0.5rem' }}>Administración</p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '400', color: '#2D5A27' }}>Lecciones</h1>
        </div>

        <section style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1.5rem', padding: '2rem', marginBottom: '2.5rem', boxShadow: '0 4px 20px rgba(74,124,63,0.06)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '400', color: '#2D5A27', marginBottom: '1.5rem' }}>Crear nueva lección</h2>
          <CreateLessonForm modules={modules || []} existingLessons={lessons || []} />
        </section>

        <section>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '400', color: '#2D5A27', marginBottom: '1.5rem' }}>Lecciones existentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {lessons && lessons.length > 0 ? lessons.map((lesson: any) => (
              <div key={lesson.id} style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1.25rem', overflow: 'hidden', display: 'flex', boxShadow: '0 2px 12px rgba(74,124,63,0.06)' }}>
                {lesson.cover_image_url && (
                  <img src={lesson.cover_image_url} alt={lesson.title} style={{ width: '100px', minWidth: '100px', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '400', color: '#2D5A27', marginBottom: '0.25rem' }}>{lesson.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#8B6914', marginBottom: '0.25rem' }}>
                      {Array.isArray(lesson.modules) ? (lesson.modules[0] as any)?.title : (lesson.modules as any)?.title || 'Sin módulo'}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(74,124,63,0.1)', color: '#2D5A27' }}>{lesson.lesson_type}</span>
                      <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'rgba(139,105,20,0.1)', color: '#8B6914' }}>Pos. {lesson.position}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <Link href={`/admin/lecciones/${lesson.id}/editar`} style={{ padding: '0.4rem 1rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.8rem', textDecoration: 'none' }}>Editar</Link>
                    <DeleteLessonButton lessonId={lesson.id} />
                  </div>
                </div>
              </div>
            )) : (
              <p style={{ color: '#5C5C4A', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>No hay lecciones cargadas.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
