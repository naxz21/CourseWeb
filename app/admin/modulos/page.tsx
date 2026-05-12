import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/is-admin'
import { createClient } from '@/lib/supabase/server'
import CreateModuleForm from '@/components/admin/CreateModuleForm'
import ModuleAccordion from '@/components/admin/ModuleAccordion'
import CourseAccordion from '@/components/admin/CourseAccordion'

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
    <>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B6914', marginBottom: '0.5rem' }}>Administración</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '400', color: '#2D5A27' }}>Módulos y Lecciones</h1>
        <p style={{ color: '#5C5C4A', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          Expandí cada curso para ver sus módulos, y cada módulo para ver y crear lecciones.
        </p>
      </div>

      {/* Árbol Curso → Módulo → Lección */}
      <section style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {courses?.map((course: any) => {
          const courseModules = (modules || [])
            .filter((m: any) => m.course_id === course.id)
            .sort((a: any, b: any) => a.position - b.position)

          const totalLessons = courseModules.reduce((acc: number, m: any) => {
            return acc + (lessons || []).filter((l: any) => l.module_id === m.id).length
          }, 0)

          return (
            <CourseAccordion
              key={course.id}
              course={course}
              moduleCount={courseModules.length}
              lessonCount={totalLessons}
              existingModules={(modules || []) as any}
            >
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
            </CourseAccordion>
          )
        })}
      </section>
    </>
  )
}
