import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/is-admin'

export default async function AdminPanelPage() {
  const { user, isAdmin } = await requireAdmin()
  if (!user) redirect('/login')
  if (!isAdmin) redirect('/dashboard')

  const sections = [
    { href: '/admin/cursos', label: 'Cursos', desc: 'Crear, editar y eliminar cursos.', icon: '📚' },
    { href: '/admin/modulos', label: 'Módulos', desc: 'Organizar módulos por curso.', icon: '🗂️' },
    { href: '/admin/lecciones', label: 'Lecciones', desc: 'Crear y ordenar lecciones.', icon: '📝' },
    { href: '/admin/profiles', label: 'Perfiles', desc: 'Ver todos los perfiles registrados.', icon: '👥' },
  ]

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5F2E8 0%, #EDE8D5 100%)', fontFamily: 'Georgia, serif' }}>
      <style>{`.admin-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(74,124,63,0.12); }`}</style>

      <header style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(74,124,63,0.15)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4A7C3F' }}>
          El Arte de Fermentar · Admin
        </span>
        <Link href="/dashboard" style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.875rem', textDecoration: 'none' }}>
          ← Dashboard
        </Link>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B6914', marginBottom: '0.5rem' }}>
            Administración
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '400', color: '#2D5A27' }}>
            Panel admin
          </h1>
          <p style={{ color: '#5C5C4A', marginTop: '0.5rem' }}>
            Administrá cursos, módulos, lecciones y perfiles.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="admin-card"
              style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1.25rem', padding: '2rem 1.5rem', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', display: 'block' }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{s.icon}</div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '400', color: '#2D5A27', marginBottom: '0.5rem' }}>{s.label}</h2>
              <p style={{ fontSize: '0.875rem', color: '#5C5C4A', lineHeight: '1.5' }}>{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
