import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/is-admin'
import { createClient } from '@/lib/supabase/server'
import EditLessonForm from '@/components/admin/EditLessonForm'

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { user, isAdmin } = await requireAdmin()

  if (!user) redirect('/login')
  if (!isAdmin) redirect('/dashboard')

  const { id } = await params
  const supabase = await createClient()

  const [{ data: lesson, error }, { data: modules }] = await Promise.all([
    supabase.from('lessons').select('*').eq('id', id).single(),
    supabase
      .from('modules')
      .select(`
        id,
        title,
        courses (
          title
        )
      `)
      .order('title', { ascending: true }),
  ])

  if (error || !lesson) {
    return (
      <main className="min-h-screen bg-black px-6 py-8 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">Lección no encontrada</h1>
          <Link
            href="/admin/lecciones"
            className="mt-4 inline-block rounded-xl border border-white/30 px-4 py-2 text-white transition hover:bg-white hover:text-black"
          >
            ← Volver
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold">Editar lección</h1>
            <p className="mt-2 text-gray-400">
              Modificá la información de la lección.
            </p>
          </div>

          <Link
            href="/admin/lecciones"
            className="rounded-xl border border-white/30 px-4 py-2 text-white transition hover:bg-white hover:text-black"
          >
            ← Volver
          </Link>
        </div>

        <section className="mt-8 rounded-3xl border border-white/30 p-6">
          <EditLessonForm lesson={lesson as any} modules={(modules as any) || []} />
        </section>
      </div>
    </main>
  )
}

