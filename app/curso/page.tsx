import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function CursosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isAdmin = false
  let activeCourseIds = new Set<string>()

  if (user) {
    const [{ data: profile }, { data: enrollments }] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).single(),
      supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id)
        .eq('status', 'active'),
    ])

    isAdmin = profile?.role === 'admin'
    activeCourseIds = new Set((enrollments || []).map((item: any) => item.course_id))
  }

  let query = supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  if (!isAdmin) {
    query = query.eq('published', true)
  }

  const { data: courses, error } = await query

  return (
    <main className="min-h-screen p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Cursos</h1>
          <p className="mt-2 text-gray-600">
            Explorá los cursos disponibles y accedé a los que ya compraste.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href={user ? '/dashboard' : '/login'}
            className="rounded-lg border px-4 py-2"
          >
            ← {user ? 'Dashboard' : 'Iniciar sesión'}
          </Link>

          {isAdmin && (
            <Link href="/admin" className="rounded-lg border px-4 py-2">
              Panel admin
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          Ocurrió un error al cargar los cursos.
        </div>
      )}

      {!error && (
        <section className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses?.map((course: any) => {
            const hasAccess = activeCourseIds.has(course.id)

            return (
              <article key={course.id} className="rounded-2xl border p-6 shadow-sm">
                <h2 className="text-2xl font-semibold">{course.title}</h2>
                <p className="mt-2 text-gray-600">
                  {course.description || 'Sin descripción'}
                </p>
                <p className="mt-4 font-medium">Precio: ${course.price}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Estado: {course.published ? 'Publicado' : 'Borrador'}
                </p>

                <Link
                  href={user ? `/curso/${course.slug}` : '/login'}
                  className="mt-6 inline-block rounded-lg bg-black px-4 py-2 text-white"
                >
                  {hasAccess ? 'Entrar al curso' : 'Explorar curso'}
                </Link>
              </article>
            )
          })}

          {courses?.length === 0 && (
            <div className="rounded-2xl border p-6 text-gray-600">
              No hay cursos disponibles por ahora.
            </div>
          )}
        </section>
      )}
    </main>
  )
}
