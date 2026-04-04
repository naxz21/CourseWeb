'use client'
import { useState, useEffect, useRef } from 'react'

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

export default function HomePage() {
  const includes = [
    'Curso 100% online',
    'Clases en video + material escrito paso a paso',
    'Acceso inmediato',
    'Acceso para siempre',
    'Acompañamiento directo de la docente',
  ]

  const learnItems = [
    'Comprender los fundamentos de la fermentación',
    'Aplicar buenas prácticas para fermentar de forma segura',
    'Elaborar kombucha',
    'Preparar chucrut',
    'Hacer vegetales fermentados',
    'Aprender a hacer kimchi',
    'Elaborar kéfir de agua y de leche',
  ]

  const offerItems = [
    '3 horas de contenido en video',
    'Más de 20 lecciones',
    'Recetas paso a paso',
    'Material complementario',
    'Acompañamiento directo de la docente',
    'Respuesta a consultas en 24–48 hs',
    'Encuentros sincrónicos de consulta cada 15 días',
  ]

  const faqs = [
    { q: '¿Es un pago único?', a: 'Sí, realizás un solo pago sin cargos adicionales.' },
    { q: '¿Por cuánto tiempo tengo acceso?', a: 'El acceso es para siempre, incluyendo actualizaciones y soporte.' },
    { q: '¿Es seguro fermentar en casa?', a: 'Sí. La fermentación es una técnica ancestral segura si se aplican correctamente las recomendaciones brindadas. En este curso aprenderás paso a paso a elaborar tus propios alimentos fermentados e incorporar la fermentación a tu vida cotidiana.' },
    { q: '¿Qué pasa si no tengo tiempo ahora?', a: 'El curso es asincrónico, para que puedas organizar tus tiempos y avanzar a tu propio ritmo.' },
    { q: '¿Puedo acceder desde el celular o tablet?', a: 'Sí, desde celular, tablet o computadora con conexión a internet.' },
    { q: '¿Necesito conocimientos previos?', a: 'No. El curso está diseñado para empezar desde cero.' },
    { q: '¿Qué utensilios necesito?', a: 'Necesitarás utensilios básicos: tabla, cuchillos, frascos de vidrio y algunos elementos adicionales, todos fáciles de conseguir y de bajo costo.' },
    { q: '¿Cuándo comienza?', a: 'El acceso es inmediato una vez realizado el pago. No hay horarios fijos.' },
  ]

  const [chatHistory, setChatHistory] = useState<{ q: string; a: string }[]>([])
  const [askedSet, setAskedSet] = useState<Set<string>>(new Set())
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleFaqClick = (faq: { q: string; a: string }) => {
    if (askedSet.has(faq.q)) return
    setChatHistory((prev) => [...prev, faq])
    setAskedSet((prev) => new Set(prev).add(faq.q))
  }

  const hero = useInView(0.1)
  const includesSection = useInView()
  const howSection = useInView()
  const programaSection = useInView()
  const ofertaSection = useInView()
  const faqSection = useInView()
  const ctaSection = useInView()

  return (
    <main style={{ minHeight: '100vh', background: '#F7F4EC', fontFamily: "'Georgia', 'Times New Roman', serif", color: '#2E3A2C', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; }

        .pf { font-family: 'Playfair Display', Georgia, serif; }
        .dm { font-family: 'DM Sans', sans-serif; }

        .container {
          width: min(1180px, calc(100% - 2.5rem));
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .section { padding: 6rem 0; }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #8B6914;
          margin-bottom: 1rem;
        }
        .eyebrow::before {
          content: '';
          display: inline-block;
          width: 22px;
          height: 1.5px;
          background: #8B6914;
          flex-shrink: 0;
        }

        .section-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          line-height: 1.1;
          font-weight: 400;
          color: #1E3D1A;
          margin: 0 0 1.2rem 0;
        }

        .section-text {
          font-family: 'DM Sans', sans-serif;
          color: #5A6050;
          font-size: 1.05rem;
          line-height: 1.85;
          max-width: 640px;
          font-weight: 300;
        }

        .card {
          background: rgba(255,255,255,0.72);
          border: 1px solid rgba(74,124,63,0.12);
          border-radius: 24px;
          box-shadow: 0 4px 32px rgba(30,61,26,0.07), 0 1px 4px rgba(30,61,26,0.04);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .card-elevated {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 12px 48px rgba(30,61,26,0.10), 0 2px 8px rgba(30,61,26,0.06);
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 999px;
          background: #2D5A27;
          color: #F7F4EC;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          letter-spacing: 0.02em;
          border: none;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          box-shadow: 0 6px 20px rgba(45,90,39,0.28);
          white-space: nowrap;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          background: #234A1E;
          box-shadow: 0 10px 28px rgba(45,90,39,0.35);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 999px;
          background: transparent;
          color: #2D5A27;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          border: 1.5px solid rgba(45,90,39,0.4);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .btn-secondary:hover {
          background: #2D5A27;
          color: #F7F4EC;
          border-color: #2D5A27;
          transform: translateY(-2px);
        }

        .badge {
          padding: 0.5rem 1rem;
          border-radius: 999px;
          border: 1px solid rgba(74,124,63,0.2);
          background: rgba(255,255,255,0.6);
          color: #3A5534;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 400;
          backdrop-filter: blur(4px);
        }

        .check-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 0.85rem;
        }
        .check-list li {
          position: relative;
          padding-left: 2rem;
          font-family: 'DM Sans', sans-serif;
          color: #4A5244;
          line-height: 1.7;
          font-weight: 300;
        }
        .check-list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.42em;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(45,90,39,0.1);
          border: 1.5px solid rgba(45,90,39,0.28);
        }
        .check-list li::after {
          content: '✓';
          position: absolute;
          left: 3px;
          top: 0.35em;
          color: #2D5A27;
          font-size: 0.7rem;
          font-weight: bold;
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 0.75rem;
        }
        .feature-list li {
          font-family: 'DM Sans', sans-serif;
          color: #4A5244;
          line-height: 1.7;
          font-weight: 300;
          padding-left: 1.4rem;
          position: relative;
        }
        .feature-list li::before {
          content: '—';
          position: absolute;
          left: 0;
          color: #8B6914;
          font-weight: 300;
        }

        .number {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(45,90,39,0.12), rgba(45,90,39,0.05));
          color: #2D5A27;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          margin-bottom: 1.1rem;
          border: 1px solid rgba(45,90,39,0.14);
        }

        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.5rem;
        }
        .grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1.1rem;
        }

        .fade-up {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .fade-up.visible { opacity: 1; transform: translateY(0); }

        .fade-up-d1 { transition-delay: 0.08s; }
        .fade-up-d2 { transition-delay: 0.18s; }
        .fade-up-d3 { transition-delay: 0.28s; }
        .fade-up-d4 { transition-delay: 0.38s; }
        .fade-up-d5 { transition-delay: 0.48s; }

        .scale-in {
          opacity: 0;
          transform: scale(0.96);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .scale-in.visible { opacity: 1; transform: scale(1); }

        .step-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .step-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 52px rgba(30,61,26,0.13);
        }

        .img-wrap {
          position: relative;
          overflow: hidden;
        }
        .img-wrap img {
          transition: transform 0.6s cubic-bezier(0.22,1,0.36,1);
        }
        .img-wrap:hover img { transform: scale(1.04); }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(74,124,63,0.16), transparent);
          margin: 0;
          border: none;
        }

        .faq-chip {
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(74,124,63,0.22);
          border-radius: 999px;
          padding: 0.5rem 1rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.87rem;
          font-weight: 400;
          color: #2E4A2B;
          cursor: pointer;
          line-height: 1.4;
          transition: background 0.18s, border-color 0.18s, transform 0.18s, box-shadow 0.18s;
        }
        .faq-chip:hover {
          background: rgba(45,90,39,0.09);
          border-color: rgba(45,90,39,0.38);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(45,90,39,0.08);
        }

        @media (max-width: 960px) {
          .grid-4 { grid-template-columns: repeat(2, 1fr); }
          .grid-2 { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .section { padding: 4.5rem 0; }
          .grid-4 { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Gradient background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 60% at 15% 10%, rgba(74,124,63,0.08) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 85% 85%, rgba(139,105,20,0.07) 0%, transparent 50%)',
      }} />

      {/* HEADER */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        background: 'rgba(247,244,236,0.82)',
        borderBottom: '1px solid rgba(74,124,63,0.09)',
        boxShadow: scrollY > 40 ? '0 4px 24px rgba(30,61,26,0.07)' : 'none',
        transition: 'box-shadow 0.3s ease',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 0', gap: '1rem' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <img src="/logo.png" alt="El Arte de Fermentar" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(74,124,63,0.2)' }} />
            <span className="pf" style={{ color: '#1E3D1A', fontSize: '1.05rem', fontWeight: 400 }}>
              <em style={{ fontStyle: 'italic', color: '#8B6914' }}>El Arte</em> de Fermentar
            </span>
          </a>
          <nav style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <a href="/login" className="btn-secondary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}>Iniciar sesión</a>
            <a href="/register" className="btn-primary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}>Inscribirme</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="section" style={{ paddingTop: '5rem', paddingBottom: '4rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'url(/fondo_difuminado.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.18,
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="grid-2" style={{ alignItems: 'center', gap: '3rem' }}>
            <div ref={hero.ref}>
              <div className={`fade-up ${hero.inView ? 'visible' : ''}`}>
                <span className="eyebrow">Curso de alimentos fermentados</span>
              </div>
              <h1 className={`pf fade-up ${hero.inView ? 'visible' : ''} fade-up-d1`} style={{
                fontSize: 'clamp(2.8rem, 6vw, 5rem)',
                lineHeight: 1.06, fontWeight: 400, color: '#1E3D1A',
                margin: '0 0 1.4rem 0',
              }}>
                Aprendé el arte de fermentar<em style={{ fontStyle: 'italic', color: '#8B6914' }}> en casa</em>
              </h1>
              <p className={`dm fade-up ${hero.inView ? 'visible' : ''} fade-up-d2`} style={{ fontSize: '1.08rem', color: '#5A6050', maxWidth: '560px', lineHeight: 1.85, margin: '0 0 0.75rem 0', fontWeight: 300 }}>
                Curso completo para aprender a fermentar con base científica.
              </p>
              <p className={`dm fade-up ${hero.inView ? 'visible' : ''} fade-up-d3`} style={{ fontSize: '1rem', color: '#5A6050', maxWidth: '560px', lineHeight: 1.85, margin: '0 0 2rem 0', fontWeight: 300 }}>
                Técnicas simples y seguras, explicadas paso a paso con ingredientes fáciles de conseguir. Desde la primera semana podrás hacer tus propios fermentos en casa.
              </p>
              <div className={`fade-up ${hero.inView ? 'visible' : ''} fade-up-d4`} style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <a href="/register" className="btn-primary" style={{ padding: '0.9rem 1.7rem', fontSize: '0.97rem' }}>Ver oferta especial</a>
                <a href="#programa" className="btn-secondary" style={{ padding: '0.9rem 1.7rem', fontSize: '0.97rem' }}>Ver programa</a>
              </div>
              <div className={`fade-up ${hero.inView ? 'visible' : ''} fade-up-d5`} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {['100% online', 'Acceso inmediato', 'A tu ritmo', 'Acceso para siempre'].map(b => (
                  <span key={b} className="badge dm">{b}</span>
                ))}
              </div>
            </div>

            <div className={`scale-in ${hero.inView ? 'visible' : ''} fade-up-d2`} style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: '-14px', borderRadius: '36px',
                background: 'linear-gradient(135deg, rgba(74,124,63,0.09), rgba(139,105,20,0.05))',
                zIndex: 0,
              }} />
              <div className="card img-wrap" style={{ position: 'relative', zIndex: 1, padding: '0.75rem', borderRadius: '24px', minHeight: '500px' }}>
                <img src="/logo.png" alt="El Arte de Fermentar" style={{ borderRadius: '18px', minHeight: '480px', objectFit: 'contain', background: '#F0EDE4', display: 'block', width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* INCLUDES + PRICE */}
      <section className="section" ref={includesSection.ref}>
        <div className="container">
          <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'stretch' }}>
            <div className={`card-elevated fade-up ${includesSection.inView ? 'visible' : ''}`} style={{ padding: '2.5rem' }}>
              <span className="eyebrow">¿Qué incluye el curso?</span>
              <h2 className="pf" style={{ margin: '0 0 1.5rem 0', fontSize: '2rem', lineHeight: 1.2, fontWeight: 400, color: '#1E3D1A' }}>
                Todo lo necesario para empezar con seguridad
              </h2>
              <ul className="check-list">
                {includes.map(item => <li key={item}>{item}</li>)}
              </ul>
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <a href="/register" className="btn-primary" style={{ padding: '0.9rem 1.6rem', fontSize: '0.96rem', alignSelf: 'flex-start' }}>
                  Ver oferta especial
                </a>
                <p className="dm" style={{ margin: 0, color: '#7A8070', fontSize: '0.88rem', fontWeight: 300 }}>
                  🔒 Pago 100% seguro. Tus datos están protegidos.
                </p>
              </div>
            </div>

            <div className={`card fade-up ${includesSection.inView ? 'visible' : ''} fade-up-d2`} style={{ padding: '2.5rem', background: 'linear-gradient(145deg, rgba(45,90,39,0.04), rgba(255,255,255,0.82))' }}>
              <span className="eyebrow">Precio promocional</span>
              <p className="dm" style={{ margin: '0 0 0.5rem 0', color: '#7A8070', fontWeight: 300, fontSize: '0.95rem' }}>Hasta el 10 de mayo</p>
              <h2 className="pf" style={{ margin: '0 0 0.3rem 0', fontSize: '3.8rem', lineHeight: 1, fontWeight: 400, color: '#1E3D1A' }}>
                $44.800
              </h2>
              <p className="dm" style={{ margin: '0 0 1.8rem 0', color: '#8B6914', fontSize: '0.78rem', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500 }}>
                Pesos argentinos
              </p>
              <ul className="check-list" style={{ marginBottom: '2rem' }}>
                <li>Pago único, sin cargos adicionales</li>
                <li>Acceso de por vida al curso</li>
                <li>Incluye actualizaciones futuras</li>
              </ul>
              <a href="/register" className="btn-primary" style={{ padding: '0.95rem 1.8rem', fontSize: '0.98rem' }}>
                Inscribirme ahora →
              </a>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* HOW IT WORKS */}
      <section className="section" ref={howSection.ref}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className={`fade-up ${howSection.inView ? 'visible' : ''}`}>
            <span className="eyebrow">¿Cómo funciona?</span>
            <h2 className="section-title">Un proceso simple, claro y rápido</h2>
            <p className="section-text dm" style={{ margin: '0 auto 3rem auto' }}>
              Te inscribís, accedés al contenido, organizás tu recorrido y empezás a fermentar a tu ritmo.
            </p>
          </div>
          <div className="grid-4">
            {[
              { n: '01', title: 'Inscribite', text: 'Completá tus datos, realizá el pago y accedé inmediatamente.' },
              { n: '02', title: 'Aprendé', text: 'Modalidad 100% online y asincrónica, con videos y materiales.' },
              { n: '03', title: 'Organizate', text: 'Módulos y lecciones. Avanzá a tu propio ritmo sin presiones.' },
              { n: '04', title: 'Disfrutá', text: 'Acceso ilimitado para siempre. Tus fermentos, tu tiempo.' },
            ].map((step, i) => (
              <div key={step.n} className={`card step-card fade-up ${howSection.inView ? 'visible' : ''} fade-up-d${i + 1}`}
                style={{ padding: '1.8rem', textAlign: 'left' }}>
                <div className="number dm">{step.n}</div>
                <h3 className="pf" style={{ margin: '0 0 0.6rem 0', fontSize: '1.25rem', fontWeight: 400, color: '#1E3D1A' }}>{step.title}</h3>
                <p className="dm" style={{ margin: 0, color: '#5D6357', lineHeight: 1.75, fontWeight: 300, fontSize: '0.95rem' }}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* WHAT YOU'LL LEARN */}
      <section className="section" id="programa" ref={programaSection.ref}>
        <div className="container">
          <div className={`fade-up ${programaSection.inView ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="eyebrow">¿Qué aprenderás?</span>
            <h2 className="section-title">Fermentación explicada de forma simple y práctica</h2>
            <p className="section-text dm" style={{ margin: '0 auto' }}>
              Fundamentos, seguridad y preparaciones concretas para empezar desde cero con confianza.
            </p>
          </div>
          <div className="grid-2" style={{ alignItems: 'center', gap: '2.5rem' }}>
            <div className={`img-wrap scale-in ${programaSection.inView ? 'visible' : ''}`} style={{ borderRadius: '24px', minHeight: '480px', overflow: 'hidden', boxShadow: '0 12px 48px rgba(30,61,26,0.10)' }}>
              <img
                src="/fermentacionexplicadadeformasimple.png"
                alt="Preparaciones fermentadas del curso"
                style={{ width: '100%', minHeight: '480px', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div className={`card-elevated fade-up ${programaSection.inView ? 'visible' : ''} fade-up-d2`} style={{ padding: '2.5rem' }}>
              <ul className="check-list">
                {learnItems.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* OFFER */}
      <section className="section" ref={ofertaSection.ref}>
        <div className="container">
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div className={`card fade-up ${ofertaSection.inView ? 'visible' : ''}`} style={{ padding: '2.5rem' }}>
              <span className="eyebrow">¿Qué te ofrecemos?</span>
              <h2 className="pf" style={{ margin: '0 0 1.5rem 0', fontSize: '2rem', lineHeight: 1.2, fontWeight: 400, color: '#1E3D1A' }}>
                Una experiencia completa y acompañada
              </h2>
              <ul className="check-list">
                {offerItems.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* FAQ CHATBOT */}
      <section className="section" ref={faqSection.ref}>
        <div className="container">
          <div className={`fade-up ${faqSection.inView ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="eyebrow">Preguntas frecuentes</span>
            <h2 className="section-title">Resolvé tus dudas antes de comprar</h2>
          </div>
          <div className={`card fade-up ${faqSection.inView ? 'visible' : ''} fade-up-d2`}
            style={{ padding: '1.75rem', maxWidth: '720px', margin: '0 auto' }}>
            {chatHistory.length > 0 && (
              <div style={{ marginBottom: '1.4rem', display: 'grid', gap: '0.9rem' }}>
                {chatHistory.map((item) => (
                  <div key={item.q}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.45rem' }}>
                      <span className="dm" style={{
                        background: '#2D5A27', color: '#F7F4EC',
                        borderRadius: '18px 18px 4px 18px',
                        padding: '0.6rem 1.1rem', fontSize: '0.92rem',
                        maxWidth: '80%', lineHeight: 1.5, fontWeight: 400,
                      }}>
                        {item.q}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(45,90,39,0.1)', border: '1px solid rgba(45,90,39,0.18)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', marginTop: '3px',
                      }}>🌿</div>
                      <span className="dm" style={{
                        background: 'rgba(45,90,39,0.06)', color: '#2E3A2C',
                        borderRadius: '4px 18px 18px 18px',
                        padding: '0.6rem 1.1rem', fontSize: '0.92rem',
                        maxWidth: '85%', lineHeight: 1.65, fontWeight: 300,
                        border: '1px solid rgba(45,90,39,0.1)',
                      }}>
                        {item.a}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div>
              <p className="dm" style={{ margin: '0 0 0.8rem 0', fontSize: '0.74rem', color: '#9BA490', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 400 }}>
                {chatHistory.length === 0 ? 'Seleccioná una pregunta' : 'Más preguntas'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {faqs.filter(f => !askedSet.has(f.q)).map(faq => (
                  <button key={faq.q} className="faq-chip" onClick={() => handleFaqClick(faq)}>
                    {faq.q}
                  </button>
                ))}
                {faqs.filter(f => !askedSet.has(f.q)).length === 0 && (
                  <p className="dm" style={{ margin: 0, color: '#9BA490', fontSize: '0.9rem', fontWeight: 300 }}>
                    ¡Respondimos todas tus preguntas! 🌿
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* CTA FINAL */}
      <section className="section" ref={ctaSection.ref} style={{ paddingBottom: '7rem' }}>
        <div className="container">
          <div className={`fade-up ${ctaSection.inView ? 'visible' : ''}`} style={{
            position: 'relative', overflow: 'hidden', borderRadius: '28px',
            background: 'linear-gradient(135deg, #1A3517 0%, #2D5A27 55%, #3A6E32 100%)',
            padding: '4.5rem 3rem', textAlign: 'center',
            boxShadow: '0 24px 64px rgba(30,61,26,0.22)',
          }}>
            <img src="/fondo_difuminado.jpg" alt="" style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', opacity: 0.1, zIndex: 0, mixBlendMode: 'luminosity',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span className="dm" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.3em',
                textTransform: 'uppercase', color: 'rgba(247,244,236,0.55)', marginBottom: '1rem',
              }}>
                <span style={{ display: 'inline-block', width: 22, height: 1, background: 'rgba(247,244,236,0.45)' }} />
                Último paso
              </span>
              <h2 className="pf" style={{
                margin: '0 0 1rem 0',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontWeight: 400, color: '#F7F4EC', lineHeight: 1.1,
              }}>
                Inscribite y empezá a fermentar en casa con seguridad
              </h2>
              <p className="dm" style={{
                margin: '0 auto 2.5rem auto', color: 'rgba(247,244,236,0.68)',
                lineHeight: 1.85, maxWidth: '580px', fontWeight: 300,
              }}>
                Acceso inmediato, modalidad asincrónica y acompañamiento para que puedas avanzar a tu propio ritmo.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
                <a href="/register" style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0.95rem 1.8rem', fontSize: '0.98rem', borderRadius: '999px',
                  background: '#F7F4EC', color: '#1E3D1A',
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                  textDecoration: 'none', cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.14)',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)' }}
                >
                  Ver oferta especial
                </a>
                <a href="/login" style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0.95rem 1.8rem', fontSize: '0.98rem', borderRadius: '999px',
                  background: 'transparent', border: '1.5px solid rgba(247,244,236,0.38)',
                  color: '#F7F4EC', fontFamily: 'DM Sans, sans-serif', fontWeight: 400,
                  textDecoration: 'none', cursor: 'pointer',
                  transition: 'border-color 0.2s ease',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(247,244,236,0.85)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(247,244,236,0.38)' }}
                >
                  Ya tengo cuenta
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
