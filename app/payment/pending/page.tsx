export default function PaymentPendingPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #F5F2E8 0%, #EDE8D5 100%)', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '520px', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(139,105,20,0.25)', borderRadius: '1.5rem', padding: '3rem 2.5rem', boxShadow: '0 8px 40px rgba(139,105,20,0.08)', textAlign: 'center' }}>

        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(139,105,20,0.1)', border: '2px solid rgba(139,105,20,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.75rem' }}>
          ⏳
        </div>

        <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8B6914', marginBottom: '0.5rem' }}>
          En proceso
        </p>

        <h1 style={{ fontSize: '2rem', fontWeight: '400', color: '#2D5A27', marginBottom: '1rem' }}>
          Pago pendiente
        </h1>

        <p style={{ color: '#5C5C4A', lineHeight: '1.7', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Tu pago todavía está pendiente de confirmación. Cuando se apruebe, el acceso al curso se habilitará automáticamente.
        </p>

        <div style={{ height: '1px', background: 'rgba(139,105,20,0.15)', marginBottom: '2rem' }} />

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/dashboard" style={{ padding: '0.75rem 2rem', borderRadius: '999px', background: '#4A7C3F', color: '#F5F2E8', fontSize: '0.95rem', textDecoration: 'none', fontFamily: 'Georgia, serif', boxShadow: '0 4px 16px rgba(74,124,63,0.2)', letterSpacing: '0.02em' }}>
            Ir al dashboard
          </a>
          <a href="/curso" style={{ padding: '0.75rem 2rem', borderRadius: '999px', border: '1.5px solid #4A7C3F', color: '#4A7C3F', fontSize: '0.95rem', textDecoration: 'none', fontFamily: 'Georgia, serif', letterSpacing: '0.02em' }}>
            Ver cursos
          </a>
        </div>
      </div>
    </main>
  )
}
