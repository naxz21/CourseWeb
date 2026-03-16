import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/is-admin'
import { createClient } from '@/lib/supabase/server'
import CreateModuleForm from '@/components/admin/CreateModuleForm'
import DeleteModuleButton from '@/components/admin/DeleteModuleButton'
import MoveModuleButtons from '@/components/admin/MoveModuleButtons'

export default async function AdminModulosPage() {
  const { user, isAdmin } = await requireAdmin()

  if (!user) redirect('/login')
  if (!isAdmin) redirect('/dashboard')

  const supabase = await createClient()

  const [{ data: courses }, { data: modules }] = await Promise.all([
    supabase.from('courses').select('id, title, slug').order('title', { ascending: true }),
    supabase
      .from('modules')
      .select(`
        id,
        title,
        description,
        position,
        course_id,
        courses (
          id,
          title
        )
      `)
      .order('course_id', { ascending: true })
      .order('position', { ascending: true }),
  ])

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Administrar módulos</h1>
            <p className="mt-2 text-gray-400">
              Creá, editá y ordená módulos por curso.
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
          <h2 className="text-2xl font-bold">Crear módulo</h2>
          <div className="mt-4">
            <CreateModuleForm
              courses={(courses as any) || []}
              existingModules={(modules as any) || []}
            />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-3xl font-bold">Módulos por curso</h2>

          <div className="mt-6 space-y-6">
            {courses?.map((course: any) => {
              const courseModules = (modules || [])
                .filter((module: any) => module.course_id === course.id)
                .sort((a: any, b: any) => a.position - b.position)

              return (
                <div
                  key={course.id}
                  className="rounded-3xl border border-white/30 p-6"
                >
                  <h3 className="text-2xl font-bold">{course.title}</h3>
                  <p className="mt-2 text-sm text-gray-400">Slug: {course.slug}</p>

                  <div className="mt-6 grid gap-4">
                    {courseModules.length === 0 && (
                      <div className="rounded-3xl border border-white/20 p-6 text-gray-400">
                        Este curso no tiene módulos todavía.
                      </div>
                    )}

                    {courseModules.map((module: any) => (
                      <div
                        key={module.id}
                        className="rounded-3xl border border-white/20 p-6"
                      >
                        <h4 className="text-xl font-bold">
                          {module.position}. {module.title}
                        </h4>

                        <p className="mt-2 text-sm text-gray-400">
                          Posición: {module.position}
                        </p>

                        {module.description && (
                          <p className="mt-4 text-gray-300">{module.description}</p>
                        )}

                        <div className="mt-6 flex flex-wrap gap-3">
                          <MoveModuleButtons moduleId={module.id} />

                          <Link
                            href={`/admin/modulos/${module.id}`}
                            className="rounded-xl border border-white/60 px-5 py-2 text-white transition hover:bg-white hover:text-black"
                          >
                            Editar
                          </Link>

                          <DeleteModuleButton moduleId={module.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
