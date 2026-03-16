import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/is-admin'
import { createClient } from '@/lib/supabase/server'
import EditModuleForm from '@/components/admin/EditModuleForm'

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { user, isAdmin } = await requireAdmin()

  if (!user) redirect('/login')
  if (!isAdmin) redirect('/dashboard')

  const { id } = await params
  const supabase = await createClient()

  const [{ data: module, error }, { data: courses }] = await Promise.all([
    supabase.from('modules').select('*').eq('id', id).single(),
    supabase.from('courses').select('id, title').order('title', { ascending: true }),
  ])

  if (error || !module) {
    return (
      <main className="min-h-screen bg-black px-6 py-8 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold">Módulo no encontrado</h1>
          <Link
            href="/admin/modulos"
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
            <h1 className="text-4xl font-bold">Editar módulo</h1>
            <p className="mt-2 text-gray-400">
              Modificá la información del módulo.
            </p>
          </div>

          <Link
            href="/admin/modulos"
            className="rounded-xl border border-white/30 px-4 py-2 text-white transition hover:bg-white hover:text-black"
          >
            ← Volver
          </Link>
        </div>

        <section className="mt-8 rounded-3xl border border-white/30 p-6">
          <EditModuleForm module={module as any} courses={(courses as any) || []} />
        </section>
      </div>
    </main>
  )
}

