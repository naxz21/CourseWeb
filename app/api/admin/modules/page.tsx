import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/is-admin'
import { createClient } from '@/lib/supabase/server'
import CreateModuleForm from '@/components/admin/CreateModuleForm'
import DeleteModuleButton from '@/components/admin/DeleteModuleButton'

export default async function AdminModulosPage() {
  const { user, isAdmin } = await requireAdmin()

  if (!user) redirect('/login')
  if (!isAdmin) redirect('/dashboard')

  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .order('title', { ascending: true })

  const { data: modules } = await supabase
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
    .order('position', { ascending: true })

  return (
    <main className="min-h-screen p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Administrar módulos</h1>
          <p className="mt-2 text-gray-600">
            Creá módulos y asignalos a un curso.
          </p>
        </div>

        <Link href="/admin" className="rounded-lg border px-4 py-2">
          ← Volver
        </Link>
      </div>

      <section className="mt-8 rounded-2xl border p-6">
        <h2 className="text-2xl font-semibold">Crear módulo</h2>
        <div className="mt-4">
          <CreateModuleForm courses={courses || []} />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold">Módulos existentes</h2>

        <div className="mt-6 grid gap-4">
          {modules?.map((module: any) => {
            const course = Array.isArray(module.courses)
              ? module.courses[0]
              : module.courses

            return (
              <div key={module.id} className="rounded-2xl border p-6 shadow-sm">
                <h3 className="text-xl font-semibold">{module.title}</h3>

                <p className="mt-1 text-sm text-gray-500">
                  Curso: {course?.title || 'Sin curso'}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Posición: {module.position}
                </p>

                {module.description && (
                  <p className="mt-2 text-gray-600">{module.description}</p>
                )}

                <div className="mt-4 flex gap-3">
                  <DeleteModuleButton moduleId={module.id} />
                </div>
              </div>
            )
          })}

          {modules?.length === 0 && (
            <div className="rounded-2xl border p-6 text-gray-600">
              No hay módulos creados todavía.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
