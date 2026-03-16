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

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Administrar cursos</h1>
            <p className="mt-2 text-gray-400">
              Creá, editá y eliminá cursos.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-white/30 px-4 py-2 text-white transition hover:bg-white hover:text-black"
          >
            ← Volver
          </Link>
        </div>

        <section className="mt-8 rounded-3xl border border-white/30 p-6">
          <h2 className="text-2xl font-bold">Crear curso</h2>
          <div className="mt-4">
            <CreateCourseForm />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-3xl font-bold">Cursos existentes</h2>

          <div className="mt-6 grid gap-4">
            {courses?.map((course: any) => (
              <div
                key={course.id}
                className="rounded-3xl border border-white/30 p-6"
              >
                <h3 className="text-2xl font-bold">{course.title}</h3>

                <p className="mt-2 text-sm text-gray-400">Slug: {course.slug}</p>
                <p className="mt-1 text-sm text-gray-400">
                  Estado: {course.published ? 'Publicado' : 'Borrador'}
                </p>

                {course.description && (
                  <p className="mt-4 text-gray-300">{course.description}</p>
                )}

                <p className="mt-4 text-xl font-semibold">Precio: ${course.price}</p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/admin/cursos/${course.id}`}
                    className="rounded-xl border border-white/60 px-5 py-2 text-white transition hover:bg-white hover:text-black"
                  >
                    Editar
                  </Link>

                  <DeleteCourseButton courseId={course.id} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}