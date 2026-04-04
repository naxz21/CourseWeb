export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #F5F2E8 0%, #EDE8D5 50%, #F0EDD8 100%)',
        fontFamily: "'Georgia', 'Times New Roman', serif",
      }}
    >
      <style>{`
        .btn-outline { transition: all 0.2s; }
        .btn-outline:hover { background: #4A7C3F !important; color: #F5F2E8 !important; }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(74,124,63,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139,105,20,0.06) 0%, transparent 50%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Header */}
      <header style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'flex-end', padding: '1.5rem 2.5rem' }}>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <a
            href="/login"
            className="btn-outline"
            style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.875rem', fontFamily: 'Georgia, serif', textDecoration: 'none', letterSpacing: '0.02em' }}
          >
            Iniciar sesión
          </a>
          <a
            href="/register"
            style={{ padding: '0.5rem 1.25rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', fontSize: '0.875rem', fontFamily: 'Georgia, serif', textDecoration: 'none', letterSpacing: '0.02em' }}
          >
            Registrarse
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 10, minHeight: '85vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem 1.5rem', gap: '2rem' }}>

        <div>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#8B6914', marginBottom: '1rem' }}>
            El Arte de Fermentar · En Casa
          </p>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: '400', color: '#2D5A27', lineHeight: '1.15', maxWidth: '700px', margin: '0 auto' }}>
            Aprendé el arte de{' '}
            <em style={{ color: '#8B6914', fontStyle: 'italic' }}>fermentar</em>
            {' '}en casa
          </h1>
        </div>

        <p style={{ fontSize: '1.1rem', color: '#5C5C4A', maxWidth: '520px', lineHeight: '1.7' }}>
          Cursos completos de fermentación artesanal. Desde kombucha hasta vegetales lacto-fermentados, con guía paso a paso.
        </p>

        <a
          href="/register"
          style={{ padding: '0.875rem 2.5rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', fontSize: '1rem', fontFamily: 'Georgia, serif', textDecoration: 'none', letterSpacing: '0.03em', boxShadow: '0 4px 20px rgba(74,124,63,0.25)' }}
        >
          Comenzar ahora
        </a>

        <div style={{ width: '60px', height: '1px', background: '#4A7C3F', opacity: 0.4 }} />

      </section>
    </main>
  )
}
