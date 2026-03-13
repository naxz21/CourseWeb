import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select(`
      id,
      status,
      course_id,
      courses (
        id,
        title,
        slug,
        description
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')

  return (
    <main className="min-h-screen p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2">Bienvenido, {user.email}</p>
        </div>

        <LogoutButton />
      </div>

      <div className="mt-6 flex gap-4">
        <a
          href="/curso"
          className="inline-block rounded-lg bg-black px-4 py-2 text-white"
        >
          Ver todos los cursos
        </a>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">Mis cursos</h2>

        {error && (
          <p className="mt-4 text-red-600">
            Ocurrió un error al cargar tus cursos.
          </p>
        )}

        {!error && enrollments && enrollments.length > 0 ? (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {enrollments.map((enrollment: any) => {
              const course = Array.isArray(enrollment.courses)
                ? enrollment.courses[0]
                : enrollment.courses

              if (!course) return null

              return (
                <div key={enrollment.id} className="rounded-2xl border p-6 shadow-sm">
                  <h3 className="text-xl font-semibold">{course.title}</h3>
                  <p className="mt-2 text-gray-600">
                    {course.description || 'Sin descripción'}
                  </p>

                  <a
                    href={`/curso/${course.slug}`}
                    className="mt-4 inline-block rounded-lg border px-4 py-2"
                  >
                    Entrar al curso
                  </a>
                </div>
              )
            })}
          </div>
        ) : (
          !error && (
            <div className="mt-6 rounded-2xl border p-6">
              <p className="text-gray-600">
                Todavía no tenés cursos activos.
              </p>

              <a
                href="/curso"
                className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-white"
              >
                Explorar cursos
              </a>
            </div>
          )
        )}
      </section>
    </main>
  )
}