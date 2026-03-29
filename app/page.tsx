export default function HomePage() {
  const highlights = [
    '100% online',
    'Acceso inmediato',
    'A tu ritmo',
    'Acceso de por vida',
  ]

  const learnItems = [
    {
      title: 'Fermentar con seguridad',
      text: 'Aprendé las bases para preparar fermentos en casa con confianza, higiene y buenos resultados.',
    },
    {
      title: 'Técnicas paso a paso',
      text: 'Desde vegetales en salmuera hasta kombucha y preparaciones probióticas simples de hacer.',
    },
    {
      title: 'Evitar errores comunes',
      text: 'Descubrí qué hacer y qué no hacer para evitar malos sabores, contaminación o fermentos fallidos.',
    },
    {
      title: 'Incorporarlos a tu rutina',
      text: 'Convertí la fermentación en un hábito práctico para sumar sabor y variedad a tu alimentación.',
    },
  ]

  const includes = [
    'Clases en video paso a paso',
    'Acceso inmediato al contenido',
    'Acceso de por vida',
    'Material complementario descargable',
    'Soporte y acompañamiento',
    'Certificado de finalización',
  ]

  const program = [
    {
      title: 'Fundamentos',
      items: ['Qué es la fermentación', 'Cuidados previos', 'Utensilios y organización'],
    },
    {
      title: 'Vegetales fermentados',
      items: ['Salado en seco', 'Chucrut', 'Kimchi', 'Fermentos en salmuera'],
    },
    {
      title: 'Bebidas y probióticos',
      items: ['Kéfir', 'Kombucha', 'Segundas fermentaciones', 'Preparaciones derivadas'],
    },
    {
      title: 'Aplicación práctica',
      items: ['Recetas simples', 'Conservación', 'Señales de buen fermento', 'Cómo seguir practicando'],
    },
  ]

  const testimonials = [
    {
      name: 'María',
      text: 'Pensé que iba a ser complicado, pero la forma de explicar es tan clara que pude empezar enseguida en casa.',
    },
    {
      name: 'Paula',
      text: 'Me gustó mucho el enfoque práctico. Todo está ordenado, simple y realmente da ganas de ponerse a hacer.',
    },
    {
      name: 'Lucía',
      text: 'La estética, la claridad y el paso a paso hacen que se sienta como un curso premium pero fácil de seguir.',
    },
  ]

  const faqs = [
    {
      q: '¿Necesito experiencia previa?',
      a: 'No. El contenido está pensado para que puedas empezar desde cero y avanzar de forma simple.',
    },
    {
      q: '¿Cuánto tiempo tengo de acceso?',
      a: 'El acceso es de por vida, así que podés hacerlo a tu ritmo y volver cuando quieras.',
    },
    {
      q: '¿Desde dónde puedo verlo?',
      a: 'Desde computadora, tablet o celular, siempre que tengas conexión a internet.',
    },
    {
      q: '¿Es pago único?',
      a: 'Sí. La idea es que sea una compra simple, sin suscripciones mensuales.',
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
          padding: 5.5rem 0;
        }

        .eyebrow {
          display: inline-block;
          font-size: 0.76rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #8B6914;
          margin-bottom: 0.85rem;
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
          font-size: 1.02rem;
          line-height: 1.8;
          max-width: 760px;
          margin: 0;
        }

        .card {
          background: rgba(255,255,255,0.62);
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

        .muted-line {
          width: 72px;
          height: 1px;
          background: rgba(74,124,63,0.32);
          margin: 0 auto;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.25rem;
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
          justify-content: center;
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

        @media (max-width: 960px) {
          .grid-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .grid-3 {
            grid-template-columns: 1fr;
          }

          .grid-2 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .section {
            padding: 4rem 0;
          }

          .grid-4 {
            grid-template-columns: 1fr;
          }
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
          <div
            className="grid-2"
            style={{
              alignItems: 'center',
              gap: '2rem',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <span className="eyebrow">Fermentación artesanal · online</span>
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
                Aprendé a fermentar en casa de forma{' '}
                <em style={{ color: '#8B6914', fontStyle: 'italic' }}>simple</em>{' '}
                y con una estética premium
              </h1>

              <p
                style={{
                  fontSize: '1.08rem',
                  color: '#5C5F53',
                  maxWidth: '620px',
                  lineHeight: 1.85,
                  margin: '0 0 1.7rem 0',
                }}
              >
                Un curso online pensado para enseñarte fermentación paso a paso:
                técnicas claras, preparaciones prácticas y una experiencia visual
                elegante, cálida y minimalista.
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
                  style={{
                    padding: '0.95rem 1.6rem',
                    fontSize: '0.98rem',
                  }}
                >
                  Acceder al curso ahora
                </a>
                <a
                  href="#programa"
                  className="btn-secondary"
                  style={{
                    padding: '0.95rem 1.6rem',
                    fontSize: '0.98rem',
                  }}
                >
                  Ver programa
                </a>
              </div>

              <div className="badge-row" style={{ justifyContent: 'flex-start' }}>
                {highlights.map((item) => (
                  <span key={item} className="badge">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div
              className="card"
              style={{
                padding: '1.35rem',
                minHeight: '420px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(248,245,238,0.85) 100%)',
              }}
            >
              <div
                style={{
                  borderRadius: '22px',
                  minHeight: '260px',
                  background:
                    'linear-gradient(135deg, rgba(74,124,63,0.18), rgba(139,105,20,0.12))',
                  border: '1px solid rgba(74,124,63,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  textAlign: 'center',
                }}
              >
                <div>
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '999px',
                      margin: '0 auto 1rem auto',
                      background: 'rgba(255,255,255,0.56)',
                      border: '1px solid rgba(74,124,63,0.14)',
                    }}
                  />
                  <p
                    style={{
                      margin: 0,
                      color: '#4B5A44',
                      lineHeight: 1.8,
                      fontSize: '1rem',
                    }}
                  >
                    Acá después podés poner una imagen, mockup del curso,
                    frascos, ingredientes o una vista previa del dashboard.
                  </p>
                </div>
              </div>

              <div style={{ paddingTop: '1.1rem' }}>
                <p
                  style={{
                    margin: '0 0 0.35rem 0',
                    color: '#8B6914',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                  }}
                >
                  Oferta de lanzamiento
                </p>
                <h3
                  style={{
                    margin: '0 0 0.55rem 0',
                    fontWeight: 400,
                    fontSize: '2rem',
                    color: '#2D5A27',
                  }}
                >
                  Acceso completo
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: '#616658',
                    lineHeight: 1.75,
                  }}
                >
                  Curso online con acceso inmediato, contenido organizado y una
                  experiencia premium desde el primer ingreso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: '2rem' }}>
        <div className="container">
          <div className="muted-line" />
        </div>
      </section>

      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow">Cómo funciona</span>
          <h2 className="section-title">Un recorrido claro, corto y simple</h2>
          <p className="section-text" style={{ margin: '0 auto 2rem auto' }}>
            La referencia usa una sección de pasos para explicar el proceso de compra
            y aprendizaje; acá lo mantuve, pero con una presentación más limpia. 
          </p>

          <div className="grid-4">
            {[
              {
                n: '01',
                title: 'Te registrás',
                text: 'Ingresás a la plataforma en pocos pasos.',
              },
              {
                n: '02',
                title: 'Accedés al contenido',
                text: 'Entrás al curso y ves las lecciones cuando quieras.',
              },
              {
                n: '03',
                title: 'Aprendés a tu ritmo',
                text: 'Sin horarios fijos, desde donde estés.',
              },
              {
                n: '04',
                title: 'Aplicás lo aprendido',
                text: 'Llevás la teoría a la práctica con confianza.',
              },
            ].map((step) => (
              <div key={step.n} className="card" style={{ padding: '1.5rem' }}>
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

      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'start', gap: '1.5rem' }}>
            <div>
              <span className="eyebrow">Qué vas a aprender</span>
              <h2 className="section-title">Contenido pensado para que empieces de verdad</h2>
              <p className="section-text">
                La página de referencia refuerza mucho el “aprender paso a paso”
                y el valor práctico del curso. Esta sección traduce esa idea a un
                formato más minimalista y visual. 
              </p>
            </div>

            <div className="grid-2">
              {learnItems.map((item) => (
                <div key={item.title} className="card" style={{ padding: '1.4rem' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '999px',
                      background: 'rgba(74,124,63,0.10)',
                      marginBottom: '1rem',
                    }}
                  />
                  <h3
                    style={{
                      margin: '0 0 0.6rem 0',
                      fontSize: '1.12rem',
                      fontWeight: 400,
                      color: '#2E4F2B',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ margin: 0, color: '#5B6155', lineHeight: 1.75 }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '1rem' }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <span className="eyebrow">Qué incluye</span>
              <h2
                style={{
                  margin: '0 0 1rem 0',
                  fontSize: '2.2rem',
                  lineHeight: 1.15,
                  fontWeight: 400,
                  color: '#2D5A27',
                }}
              >
                Todo lo necesario para una experiencia completa
              </h2>
              <ul className="check-list">
                {includes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <span className="eyebrow">Para quién es</span>
              <h2
                style={{
                  margin: '0 0 1rem 0',
                  fontSize: '2.2rem',
                  lineHeight: 1.15,
                  fontWeight: 400,
                  color: '#2D5A27',
                }}
              >
                Ideal si buscás aprender sin complicarte
              </h2>
              <ul className="check-list">
                <li>Querés empezar desde cero con una guía ordenada.</li>
                <li>Buscás una formación linda, clara y fácil de seguir.</li>
                <li>Te interesa sumar fermentos a tu alimentación cotidiana.</li>
                <li>Querés un curso online con buena estética y buena experiencia.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="programa" className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="eyebrow">Programa</span>
            <h2 className="section-title">Un programa completo, pero fácil de navegar</h2>
            <p className="section-text" style={{ margin: '0 auto' }}>
              La referencia detalla módulos y temas concretos del curso. Acá lo
              adapté a bloques bien claros para que la landing se vea más premium y
              menos cargada. 
            </p>
          </div>

          <div className="grid-2">
            {program.map((block) => (
              <div key={block.title} className="card" style={{ padding: '1.7rem' }}>
                <h3
                  style={{
                    margin: '0 0 1rem 0',
                    fontSize: '1.25rem',
                    fontWeight: 400,
                    color: '#2F4F2C',
                  }}
                >
                  {block.title}
                </h3>

                <ul className="check-list">
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '1rem' }}>
        <div className="container">
          <div
            className="card"
            style={{
              padding: '2.1rem',
              textAlign: 'center',
            }}
          >
            <span className="eyebrow">Confianza</span>
            <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>
              Compra simple, acceso claro y experiencia cuidada
            </h2>
            <p className="section-text" style={{ margin: '0 auto 2rem auto' }}>
              El sitio de referencia destaca acceso inmediato, pago único, garantía
              y soporte como elementos de confianza; por eso esta sección resume
              esos factores en una versión más elegante.
            </p>

            <div className="grid-3">
              <div className="card" style={{ padding: '1.35rem' }}>
                <h3
                  style={{
                    margin: '0 0 0.5rem 0',
                    fontWeight: 400,
                    color: '#2D5A27',
                  }}
                >
                  Acceso inmediato
                </h3>
                <p style={{ margin: 0, color: '#5D6357', lineHeight: 1.7 }}>
                  Entrás al contenido apenas completás el proceso.
                </p>
              </div>
              <div className="card" style={{ padding: '1.35rem' }}>
                <h3
                  style={{
                    margin: '0 0 0.5rem 0',
                    fontWeight: 400,
                    color: '#2D5A27',
                  }}
                >
                  A tu ritmo
                </h3>
                <p style={{ margin: 0, color: '#5D6357', lineHeight: 1.7 }}>
                  Sin horarios fijos ni presión. Avanzás cuando quieras.
                </p>
              </div>
              <div className="card" style={{ padding: '1.35rem' }}>
                <h3
                  style={{
                    margin: '0 0 0.5rem 0',
                    fontWeight: 400,
                    color: '#2D5A27',
                  }}
                >
                  Pago único
                </h3>
                <p style={{ margin: 0, color: '#5D6357', lineHeight: 1.7 }}>
                  Una sola compra para acceder a todo el material.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="eyebrow">Testimonios</span>
            <h2 className="section-title">Una landing que transmite confianza vende mejor</h2>
            <p className="section-text" style={{ margin: '0 auto' }}>
              La referencia usa reseñas en gran cantidad para reforzar credibilidad;
              acá te dejé una versión minimalista con tarjetas limpias para que después
              reemplaces por testimonios reales.
            </p>
          </div>

          <div className="grid-3">
            {testimonials.map((item) => (
              <div key={item.name} className="card" style={{ padding: '1.6rem' }}>
                <p
                  style={{
                    margin: '0 0 1rem 0',
                    color: '#4F5549',
                    lineHeight: 1.85,
                    fontSize: '1rem',
                  }}
                >
                  “{item.text}”
                </p>
                <p
                  style={{
                    margin: 0,
                    color: '#2F4F2C',
                    letterSpacing: '0.04em',
                  }}
                >
                  — {item.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '1rem' }}>
        <div className="container">
          <div
            className="card"
            style={{
              padding: '2.3rem',
              textAlign: 'center',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(244,239,227,0.88) 100%)',
            }}
          >
            <span className="eyebrow">Oferta</span>
            <h2 className="section-title" style={{ marginBottom: '0.7rem' }}>
              Empezá hoy con una propuesta clara y atractiva
            </h2>
            <p
              style={{
                margin: '0 auto 1.25rem auto',
                color: '#5E6357',
                maxWidth: '700px',
                lineHeight: 1.85,
                fontSize: '1.02rem',
              }}
            >
              Podés reemplazar este bloque por tu precio real, promoción y condiciones.
              La página de referencia repite la oferta y el CTA para sostener la
              conversión durante todo el recorrido. 
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
                Precio lanzamiento
              </p>
              <h3
                style={{
                  margin: 0,
                  fontSize: '2.4rem',
                  fontWeight: 400,
                  color: '#2D5A27',
                }}
              >
                $XX
              </h3>
              <p style={{ margin: '0.45rem 0 0 0', color: '#5E6357' }}>
                Pago único · Acceso de por vida
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <a
                href="/register"
                className="btn-primary"
                style={{
                  padding: '1rem 1.8rem',
                  fontSize: '1rem',
                }}
              >
                Quiero acceder ahora
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="eyebrow">Preguntas frecuentes</span>
            <h2 className="section-title">Respuestas simples para las dudas más comunes</h2>
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

      <section className="section" style={{ paddingTop: '1.5rem', paddingBottom: '5rem' }}>
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
              Convertí esta landing en una página que además de verse bien, venda
            </h2>
            <p
              style={{
                margin: '0 auto 1.5rem auto',
                color: '#5D6357',
                lineHeight: 1.85,
                maxWidth: '760px',
              }}
            >
              Ya tenés una buena base visual. Con esta estructura sumás valor percibido,
              claridad, confianza y mejores puntos de conversión sin perder el estilo
              minimalista.
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
                Empezar ahora
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