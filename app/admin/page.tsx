import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/is-admin'

export default async function AdminPanelPage() {
  const { user, isAdmin } = await requireAdmin()

  if (!user) redirect('/login')
  if (!isAdmin) redirect('/dashboard')

  return (
    <main className="min-h-screen p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Panel admin</h1>
          <p className="mt-2 text-gray-600">
            Administrá cursos, módulos, lecciones y perfiles.
          </p>
        </div>

        <Link href="/dashboard" className="rounded-lg border px-4 py-2">
          ← Volver al dashboard
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <Link href="/admin/cursos" className="rounded-2xl border p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Cursos</h2>
          <p className="mt-2 text-gray-600">Crear, editar y eliminar cursos.</p>
        </Link>

        <Link href="/admin/modulos" className="rounded-2xl border p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Módulos</h2>
          <p className="mt-2 text-gray-600">Organizar módulos por curso.</p>
        </Link>

        <Link href="/admin/lecciones" className="rounded-2xl border p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Lecciones</h2>
          <p className="mt-2 text-gray-600">Crear y ordenar lecciones.</p>
        </Link>

        <Link href="/admin/profiles" className="rounded-2xl border p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Perfiles</h2>
          <p className="mt-2 text-gray-600">
            Ver todos los perfiles registrados.
          </p>
        </Link>
      </section>
    </main>
  )
}