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
    'Aprender kimchi',
    'Elaborar kéfir de agua y de leche',
  ]

  const offerItems = [
    '3 horas de contenido en video',
    'Más de 20 lecciones',
    'Recetas paso a paso',
    'Material complementario',
    'Acompañamiento directo de la docente',
    'Respuesta a consultas en 24–48 hs',
  ]

  const faqs = [
    {
      q: '¿Es un pago único?',
      a: 'Sí, realizás un solo pago sin cargos adicionales.',
    },
    {
      q: '¿Por cuánto tiempo tengo acceso?',
      a: 'El acceso es para siempre, incluyendo actualizaciones y soporte.',
    },
    {
      q: '¿Es seguro fermentar en casa?',
      a: 'Sí. La fermentación es una técnica ancestral segura si se aplican correctamente las recomendaciones brindadas. En este curso aprenderás paso a paso a elaborar tus propios alimentos fermentados e incorporar la fermentación a tu vida cotidiana.',
    },
    {
      q: '¿Qué pasa si no tengo tiempo ahora?',
      a: 'El curso es asincrónico, para que puedas organizar tus tiempos y avanzar a tu propio ritmo.',
    },
    {
      q: '¿Puedo acceder desde el celular o tablet?',
      a: 'Sí, desde celular, tablet o computadora con conexión a internet.',
    },
    {
      q: '¿Necesito conocimientos previos?',
      a: 'No. El curso está diseñado para empezar desde cero.',
    },
    {
      q: '¿Qué utensilios necesito?',
      a: 'Necesitarás utensilios básicos: tabla, cuchillos, frascos de vidrio y algunos elementos adicionales, todos fáciles de conseguir y de bajo costo.',
    },
    {
      q: '¿Cuándo comienza?',
      a: 'El acceso es inmediato una vez realizado el pago. No hay horarios fijos.',
    },
  ]

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(160deg, #F7F4EC 0%, #EFE9DB 50%, #F6F2E8 100%)',
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: '#2E3A2C',
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        .container {
          width: min(1180px, calc(100% - 2rem));
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .section {
          padding: 5.2rem 0;
        }

        .eyebrow {
          display: inline-block;
          font-size: 0.76rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #8B6914;
          margin-bottom: 0.9rem;
        }

        .section-title {
          font-size: clamp(2rem, 4vw, 3.2rem);
          line-height: 1.15;
          font-weight: 400;
          color: #2D5A27;
          margin: 0 0 1rem 0;
        }

        .section-text {
          color: #5E6254;
          font-size: 1.03rem;
          line-height: 1.8;
          max-width: 760px;
          margin: 0;
        }

        .card {
          background: rgba(255,255,255,0.64);
          border: 1px solid rgba(74,124,63,0.10);
          border-radius: 28px;
          box-shadow: 0 10px 40px rgba(62, 74, 44, 0.06);
          backdrop-filter: blur(6px);
        }

        .btn-primary,
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 999px;
          transition: transform .18s ease, box-shadow .18s ease, background .18s ease, color .18s ease;
          cursor: pointer;
          white-space: nowrap;
        }

        .btn-primary:hover,
        .btn-secondary:hover {
          transform: translateY(-1px);
        }

        .btn-primary {
          background: #4A7C3F;
          color: #F8F5EE;
          box-shadow: 0 8px 24px rgba(74,124,63,0.22);
        }

        .btn-primary:hover {
          background: #406C36;
        }

        .btn-secondary {
          background: transparent;
          color: #4A7C3F;
          border: 1.5px solid #4A7C3F;
        }

        .btn-secondary:hover {
          background: #4A7C3F;
          color: #F8F5EE;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.4rem;
        }

        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.25rem;
        }

        .grid-4 {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
        }

        .badge-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: flex-start;
        }

        .badge {
          padding: 0.65rem 1rem;
          border-radius: 999px;
          border: 1px solid rgba(74,124,63,0.16);
          background: rgba(255,255,255,0.55);
          color: #486242;
          font-size: 0.95rem;
          line-height: 1;
        }

        .number {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(74,124,63,0.10);
          color: #2D5A27;
          font-size: 0.95rem;
          margin-bottom: 1rem;
        }

        .check-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 0.95rem;
        }

        .check-list li {
          position: relative;
          padding-left: 1.9rem;
          color: #52584C;
          line-height: 1.7;
        }

        .check-list li::before {
          content: "✓";
          position: absolute;
          left: 0;
          top: 0;
          color: #4A7C3F;
          font-weight: bold;
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 0.85rem;
        }

        .feature-list li {
          color: #565C50;
          line-height: 1.7;
          padding-left: 1.6rem;
          position: relative;
        }

        .feature-list li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: #8B6914;
        }

        .faq-item {
          padding: 1.2rem 0;
          border-bottom: 1px solid rgba(74,124,63,0.12);
        }

        .faq-item:last-child {
          border-bottom: none;
        }

        .faq-question {
          font-size: 1.02rem;
          color: #2F4F2C;
          margin: 0 0 0.45rem 0;
        }

        .faq-answer {
          margin: 0;
          color: #5F6558;
          line-height: 1.75;
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        @media (max-width: 960px) {
          .grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-3 { grid-template-columns: 1fr; }
          .grid-2 { grid-template-columns: 1fr; }
        }

        @media (max-width: 640px) {
          .section { padding: 4rem 0; }
          .grid-4 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage:
            'radial-gradient(circle at 15% 15%, rgba(74,124,63,0.07) 0%, transparent 34%), radial-gradient(circle at 85% 80%, rgba(139,105,20,0.06) 0%, transparent 30%), radial-gradient(circle at 50% 55%, rgba(255,255,255,0.35) 0%, transparent 40%)',
        }}
      />

      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backdropFilter: 'blur(10px)',
          background: 'rgba(247, 244, 236, 0.72)',
          borderBottom: '1px solid rgba(74,124,63,0.08)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 0',
            gap: '1rem',
          }}
        >
          <a
            href="/"
            style={{
              textDecoration: 'none',
              color: '#2D5A27',
              fontSize: '1rem',
              letterSpacing: '0.04em',
            }}
          >
            <span style={{ fontStyle: 'italic', color: '#8B6914' }}>El Arte</span>{' '}
            de Fermentar
          </a>

          <nav style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a
              href="/login"
              className="btn-secondary"
              style={{ padding: '0.65rem 1.2rem', fontSize: '0.9rem' }}
            >
              Iniciar sesión
            </a>
            <a
              href="/register"
              className="btn-primary"
              style={{ padding: '0.65rem 1.2rem', fontSize: '0.9rem' }}
            >
              Registrarse
            </a>
          </nav>
        </div>
      </header>

      <section className="section" style={{ paddingTop: '4.5rem', paddingBottom: '3.5rem' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '2rem' }}>
            <div>
              <span className="eyebrow">Curso de alimentos fermentados</span>
              <h1
                style={{
                  fontSize: 'clamp(2.6rem, 6vw, 5rem)',
                  lineHeight: 1.08,
                  fontWeight: 400,
                  color: '#2D5A27',
                  margin: '0 0 1.25rem 0',
                  maxWidth: '760px',
                }}
              >
                Aprendé el arte de fermentar en casa
              </h1>

              <p
                style={{
                  fontSize: '1.08rem',
                  color: '#5C5F53',
                  maxWidth: '620px',
                  lineHeight: 1.85,
                  margin: '0 0 1rem 0',
                }}
              >
                Curso completo para aprender a fermentar con base científica, de forma
                simple y segura.
              </p>

              <p
                style={{
                  fontSize: '1.02rem',
                  color: '#5C5F53',
                  maxWidth: '620px',
                  lineHeight: 1.85,
                  margin: '0 0 1.7rem 0',
                }}
              >
                Técnicas simples y seguras, explicadas paso a paso con ingredientes
                fáciles de conseguir. Desde la primera semana podrás hacer tus propios
                fermentos en casa.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '0.9rem',
                  flexWrap: 'wrap',
                  marginBottom: '1.35rem',
                }}
              >
                <a
                  href="/register"
                  className="btn-primary"
                  style={{ padding: '0.95rem 1.6rem', fontSize: '0.98rem' }}
                >
                  Ver oferta especial
                </a>
                <a
                  href="#programa"
                  className="btn-secondary"
                  style={{ padding: '0.95rem 1.6rem', fontSize: '0.98rem' }}
                >
                  Ver programa
                </a>
              </div>

              <div className="badge-row">
                <span className="badge">100% online</span>
                <span className="badge">Acceso inmediato</span>
                <span className="badge">A tu ritmo</span>
                <span className="badge">Acceso para siempre</span>
              </div>
            </div>

            <div
              className="card"
              style={{
                padding: '1rem',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  borderRadius: '22px',
                  overflow: 'hidden',
                  minHeight: '520px',
                  background: '#E9E3D5',
                }}
              >
                <img
                  src="/fermentos.jpg"
                  alt="Frascos con alimentos fermentados"
                  className="hero-image"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '1rem' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <span className="eyebrow">¿Qué incluye el curso?</span>
              <h2
                style={{
                  margin: '0 0 1rem 0',
                  fontSize: '2.1rem',
                  lineHeight: 1.15,
                  fontWeight: 400,
                  color: '#2D5A27',
                }}
              >
                Todo lo necesario para empezar con seguridad
              </h2>
              <ul className="check-list">
                {includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div style={{ marginTop: '1.5rem' }}>
                <a
                  href="/register"
                  className="btn-primary"
                  style={{ padding: '0.9rem 1.5rem', fontSize: '0.96rem' }}
                >
                  Ver oferta especial
                </a>
              </div>

              <p
                style={{
                  margin: '1rem 0 0 0',
                  color: '#5F6558',
                  lineHeight: 1.75,
                  fontSize: '0.95rem',
                }}
              >
                🔒 Pago 100% seguro. Tus datos están protegidos en todo momento.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <span className="eyebrow">Precio promocional</span>
              <p
                style={{
                  margin: '0 0 0.6rem 0',
                  color: '#5F6558',
                  lineHeight: 1.6,
                }}
              >
                Hasta el 10 de mayo
              </p>

              <h2
                style={{
                  margin: '0 0 0.8rem 0',
                  fontSize: '3rem',
                  lineHeight: 1,
                  fontWeight: 400,
                  color: '#2D5A27',
                }}
              >
                $ 34.800
              </h2>

              <ul className="check-list" style={{ marginBottom: '1.4rem' }}>
                <li>Pago único</li>
                <li>Acceso de por vida</li>
                <li>Moneda: Pesos argentinos</li>
              </ul>

              <a
                href="/register"
                className="btn-primary"
                style={{ padding: '0.95rem 1.6rem', fontSize: '0.98rem' }}
              >
                Inscribirme ahora
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow">¿Cómo funciona?</span>
          <h2 className="section-title">Un proceso simple, claro y rápido</h2>
          <p className="section-text" style={{ margin: '0 auto 2rem auto' }}>
            Te inscribís, accedés al contenido, organizás tu recorrido y empezás a
            fermentar a tu ritmo desde cualquier dispositivo.
          </p>

          <div className="grid-4">
            {[
              {
                n: '01',
                title: 'Inscribite en 1 minuto',
                text: 'Completá tus datos, realizá el pago y accedé inmediatamente al curso.',
              },
              {
                n: '02',
                title: 'Aprendé a tu ritmo',
                text: 'Modalidad 100% online y asincrónica, con videos y materiales explicativos.',
              },
              {
                n: '03',
                title: 'Organizá tu recorrido',
                text: 'El curso está dividido en módulos y lecciones. Podés avanzar a tu ritmo.',
              },
              {
                n: '04',
                title: 'Disfrutá los resultados',
                text: 'Acceso ilimitado para siempre.',
              },
            ].map((step) => (
              <div key={step.n} className="card" style={{ padding: '1.5rem', textAlign: 'left' }}>
                <div className="number">{step.n}</div>
                <h3
                  style={{
                    margin: '0 0 0.7rem 0',
                    fontSize: '1.2rem',
                    fontWeight: 400,
                    color: '#2E4F2B',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: '#5D6357',
                    lineHeight: 1.75,
                  }}
                >
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="programa">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="eyebrow">¿Qué aprenderás?</span>
            <h2 className="section-title">Fermentación explicada de forma simple y práctica</h2>
            <p className="section-text" style={{ margin: '0 auto' }}>
              Vas a aprender fundamentos, seguridad y preparaciones concretas para
              empezar desde cero con confianza.
            </p>
          </div>

          <div className="grid-2" style={{ alignItems: 'center', gap: '2rem' }}>
            <div className="card" style={{ padding: '1rem', overflow: 'hidden' }}>
              <div
                style={{
                  borderRadius: '22px',
                  overflow: 'hidden',
                  minHeight: '520px',
                  background: '#E9E3D5',
                }}
              >
                <img
                  src="/fermentos.jpg"
                  alt="Preparaciones fermentadas del curso"
                  className="hero-image"
                />
              </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <ul className="check-list">
                {learnItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '1rem' }}>
        <div className="container">
          <div className="grid-2" style={{ gap: '1.5rem', alignItems: 'start' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <span className="eyebrow">¿Qué te ofrecemos?</span>
              <h2
                style={{
                  margin: '0 0 1rem 0',
                  fontSize: '2.1rem',
                  lineHeight: 1.15,
                  fontWeight: 400,
                  color: '#2D5A27',
                }}
              >
                Una experiencia completa y acompañada
              </h2>
              <ul className="check-list">
                {offerItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <span className="eyebrow">¿Quién imparte el curso?</span>
              <h2
                style={{
                  margin: '0 0 1rem 0',
                  fontSize: '2.1rem',
                  lineHeight: 1.15,
                  fontWeight: 400,
                  color: '#2D5A27',
                }}
              >
                Presentación de la docente
              </h2>

              <p
                style={{
                  margin: '0 0 1rem 0',
                  color: '#5E6254',
                  lineHeight: 1.8,
                }}
              >
                Acá podés agregar la foto de la docente y una breve presentación
                profesional con su formación, experiencia y enfoque del curso.
              </p>

              <ul className="feature-list">
                <li>Breve CV o trayectoria profesional</li>
                <li>Experiencia en fermentación y alimentación</li>
                <li>Enfoque práctico, claro y basado en evidencia</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '1rem' }}>
        <div className="container">
          <div
            className="card"
            style={{
              padding: '2.5rem',
              textAlign: 'center',
            }}
          >
            <span className="eyebrow">Oferta especial</span>
            <h2
              style={{
                margin: '0 0 0.8rem 0',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                lineHeight: 1.15,
                fontWeight: 400,
                color: '#2D5A27',
              }}
            >
              Empezá hoy y accedé inmediatamente al curso
            </h2>

            <p
              style={{
                margin: '0 auto 1.4rem auto',
                color: '#5D6357',
                lineHeight: 1.8,
                maxWidth: '760px',
              }}
            >
              Curso online, asincrónico, con acceso para siempre y acompañamiento
              directo de la docente.
            </p>

            <div
              style={{
                display: 'inline-block',
                padding: '1.2rem 1.6rem',
                borderRadius: '24px',
                border: '1px solid rgba(74,124,63,0.12)',
                background: 'rgba(255,255,255,0.65)',
                marginBottom: '1.3rem',
              }}
            >
              <p
                style={{
                  margin: '0 0 0.35rem 0',
                  color: '#8B6914',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  fontSize: '0.72rem',
                }}
              >
                Precio promocional
              </p>
              <h3
                style={{
                  margin: 0,
                  fontSize: '2.4rem',
                  fontWeight: 400,
                  color: '#2D5A27',
                }}
              >
                $ 34.800
              </h3>
              <p style={{ margin: '0.45rem 0 0 0', color: '#5E6357' }}>
                Pago único · Acceso para siempre · Pesos argentinos
              </p>
            </div>

            <div>
              <a
                href="/register"
                className="btn-primary"
                style={{ padding: '1rem 1.8rem', fontSize: '1rem' }}
              >
                Inscribirme ahora
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="eyebrow">Preguntas frecuentes</span>
            <h2 className="section-title">Resolvé tus dudas antes de comprar</h2>
          </div>

          <div className="card" style={{ padding: '0 1.5rem' }}>
            {faqs.map((item) => (
              <div key={item.q} className="faq-item">
                <h3 className="faq-question">{item.q}</h3>
                <p className="faq-answer">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '1rem', paddingBottom: '5rem' }}>
        <div className="container">
          <div
            className="card"
            style={{
              padding: '2.5rem',
              textAlign: 'center',
            }}
          >
            <span className="eyebrow">Último paso</span>
            <h2
              style={{
                margin: '0 0 0.9rem 0',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                lineHeight: 1.15,
                fontWeight: 400,
                color: '#2D5A27',
              }}
            >
              Inscribite y empezá a fermentar en casa con seguridad
            </h2>
            <p
              style={{
                margin: '0 auto 1.5rem auto',
                color: '#5D6357',
                lineHeight: 1.85,
                maxWidth: '760px',
              }}
            >
              Acceso inmediato, modalidad asincrónica y acompañamiento para que
              puedas avanzar a tu propio ritmo.
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.9rem',
                flexWrap: 'wrap',
              }}
            >
              <a
                href="/register"
                className="btn-primary"
                style={{ padding: '0.95rem 1.6rem', fontSize: '0.98rem' }}
              >
                Ver oferta especial
              </a>
              <a
                href="/login"
                className="btn-secondary"
                style={{ padding: '0.95rem 1.6rem', fontSize: '0.98rem' }}
              >
                Ya tengo cuenta
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}