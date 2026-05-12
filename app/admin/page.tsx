import Link from 'next/link'

export default async function AdminPanelPage() {
  const sections = [
    { href: '/admin/cursos', label: 'Cursos', desc: 'Crear, editar y eliminar cursos.', icon: '📚' },
    { href: '/admin/modulos', label: 'Módulos y Lecciones', desc: 'Organizar módulos, lecciones y cargar contenido.', icon: '🗂️' },
    { href: '/admin/codigos', label: 'Códigos de acceso', desc: 'Crear códigos para desbloquear cursos.', icon: '🔑' },
    { href: '/admin/profiles', label: 'Perfiles', desc: 'Ver todos los perfiles registrados.', icon: '👥' },
  ]

  return (
    <>
      <style>{`.admin-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(74,124,63,0.12); }`}</style>
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B6914', marginBottom: '0.5rem' }}>Administración</p>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '400', color: '#2D5A27' }}>Panel admin</h1>
        <p style={{ color: '#5C5C4A', marginTop: '0.5rem', fontSize: '0.9rem' }}>Administrá cursos, módulos, lecciones y perfiles.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="admin-card"
            style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(74,124,63,0.2)', borderRadius: '1.25rem', padding: '2rem 1.5rem', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', display: 'block' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{s.icon}</div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '400', color: '#2D5A27', marginBottom: '0.5rem' }}>{s.label}</h2>
            <p style={{ fontSize: '0.85rem', color: '#5C5C4A', lineHeight: '1.5', margin: 0 }}>{s.desc}</p>
          </Link>
        ))}
      </div>
    </>
  )
}
