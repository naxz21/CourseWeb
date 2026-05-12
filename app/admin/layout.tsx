import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/is-admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = await requireAdmin()
  if (!user) redirect('/login')
  if (!isAdmin) redirect('/dashboard')

  const navLinks = [
    { href: '/admin', label: 'Panel Admin', icon: '🏠', exact: true },
    { href: '/admin/cursos', label: 'Cursos', icon: '📚' },
    { href: '/admin/modulos', label: 'Módulos y Lecciones', icon: '🗂️' },
    { href: '/admin/codigos', label: 'Códigos de acceso', icon: '🔑' },
    { href: '/admin/profiles', label: 'Perfiles', icon: '👥' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5F2E8 0%, #EDE8D5 100%)', fontFamily: 'Georgia, serif', display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <header style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(74,124,63,0.15)', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4A7C3F' }}>
          El Arte de Fermentar · Admin
        </span>
        <Link href="/dashboard" style={{ padding: '0.4rem 1.1rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.82rem', textDecoration: 'none' }}>
          ← Dashboard
        </Link>
      </header>

      {/* Body: sidebar + content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <aside style={{
          width: '220px', minWidth: '220px',
          borderRight: '1px solid rgba(74,124,63,0.15)',
          background: 'rgba(255,255,255,0.4)',
          backdropFilter: 'blur(8px)',
          padding: '1.5rem 1rem',
          display: 'flex', flexDirection: 'column', gap: '0.35rem',
          position: 'sticky', top: '48px', height: 'calc(100vh - 48px)', overflowY: 'auto',
        }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#8B6914', marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>
            Navegación
          </p>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.6rem 0.75rem', borderRadius: '0.75rem', textDecoration: 'none', color: '#2D5A27', fontSize: '0.875rem', transition: 'background 0.15s' }}
              className="admin-nav-link"
            >
              <span style={{ fontSize: '1rem' }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 2rem' }}>
          <style>{`
            .admin-nav-link:hover { background: rgba(74,124,63,0.1); }
          `}</style>
          {children}
        </main>
      </div>
    </div>
  )
}
