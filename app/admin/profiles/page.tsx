import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/is-admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

type SearchParams = Promise<{
  q?: string
  role?: string
}>

export default async function AdminProfilesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { user, isAdmin } = await requireAdmin()

  if (!user) redirect('/login')
  if (!isAdmin) redirect('/dashboard')

  const params = await searchParams
  const q = params.q?.trim() || ''
  const role = params.role?.trim() || 'all'

  let query = supabaseAdmin
    .from('profiles')
    .select(`
      id,
      email,
      role,
      full_name,
      address,
      city,
      state,
      country,
      document_type,
      document_number,
      profession,
      created_at
    `)
    .order('full_name', { ascending: true, nullsFirst: false })
    .order('email', { ascending: true })

  if (role !== 'all') {
    query = query.eq('role', role)
  }

  if (q) {
    query = query.or(
      `full_name.ilike.%${q}%,email.ilike.%${q}%,city.ilike.%${q}%,country.ilike.%${q}%`
    )
  }

  const { data: profiles, error } = await query

  const roleBadgeClasses = (profileRole: string | null) => {
    if (profileRole === 'admin') {
      return 'bg-red-100 text-red-700 border border-red-200'
    }

    if (profileRole === 'student') {
      return 'bg-blue-100 text-blue-700 border border-blue-200'
    }

    return 'bg-gray-100 text-gray-700 border border-gray-200'
  }

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Perfiles registrados</h1>
          <p className="mt-1 text-sm text-gray-400">
            Administrá y visualizá todos los usuarios registrados.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          ← Volver al panel admin
        </Link>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm">
        <form className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, email, ciudad o país..."
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-gray-400 outline-none transition focus:border-blue-500"
          />

          <select
            name="role"
            defaultValue={role}
            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-blue-500"
          >
            <option value="all">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="student">Student</option>
            <option value="user">User</option>
          </select>

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-500"
          >
            Buscar
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          Ocurrió un error al cargar los perfiles: {error.message}
        </div>
      )}

      {!error && (!profiles || profiles.length === 0) && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-gray-300">
          No hay perfiles registrados con esos filtros.
        </div>
      )}

      {!error && profiles && profiles.length > 0 && (
        <>
          <div className="mb-3 text-sm text-gray-400">
            Total encontrados: <span className="font-semibold text-white">{profiles.length}</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40 shadow-lg">
            <table className="min-w-full text-sm text-white">
              <thead className="bg-slate-800 text-left text-sm text-white">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-4 font-semibold whitespace-nowrap">Nombre completo</th>
                  <th className="px-4 py-4 font-semibold whitespace-nowrap">Email</th>
                  <th className="px-4 py-4 font-semibold whitespace-nowrap">Rol</th>
                  <th className="px-4 py-4 font-semibold whitespace-nowrap">Dirección</th>
                  <th className="px-4 py-4 font-semibold whitespace-nowrap">Ciudad</th>
                  <th className="px-4 py-4 font-semibold whitespace-nowrap">Provincia / Estado</th>
                  <th className="px-4 py-4 font-semibold whitespace-nowrap">País</th>
                  <th className="px-4 py-4 font-semibold whitespace-nowrap">Tipo doc.</th>
                  <th className="px-4 py-4 font-semibold whitespace-nowrap">Nro doc.</th>
                  <th className="px-4 py-4 font-semibold whitespace-nowrap">Profesión</th>
                </tr>
              </thead>

              <tbody>
                {profiles.map((profile: any, index: number) => (
                  <tr
                    key={profile.id}
                    className={`border-b border-white/10 align-top transition hover:bg-white/5 ${
                      index % 2 === 0 ? 'bg-transparent' : 'bg-white/2'
                    }`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      {profile.full_name || '-'}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {profile.email || '-'}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${roleBadgeClasses(
                          profile.role
                        )}`}
                      >
                        {profile.role || 'user'}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {profile.address || '-'}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {profile.city || '-'}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {profile.state || '-'}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {profile.country || '-'}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {profile.document_type || '-'}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {profile.document_number || '-'}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      {profile.profession || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  )
}