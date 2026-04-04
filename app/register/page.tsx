'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [stateProvince, setStateProvince] = useState('')
  const [country, setCountry] = useState('')
  const [documentType, setDocumentType] = useState('dni')
  const [documentNumber, setDocumentNumber] = useState('')
  const [profession, setProfession] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'error' | 'success'>('error')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const validations: [boolean, string][] = [
      [!fullName.trim(), 'Ingresá tu nombre completo'],
      [!address.trim(), 'Ingresá tu dirección'],
      [!city.trim(), 'Ingresá tu ciudad'],
      [!stateProvince.trim(), 'Ingresá tu provincia/estado'],
      [!country.trim(), 'Ingresá tu país'],
      [!documentNumber.trim(), 'Ingresá tu número de documento'],
      [!profession.trim(), 'Ingresá tu profesión'],
    ]

    for (const [condition, msg] of validations) {
      if (condition) {
        setMessage(msg)
        setMessageType('error')
        setLoading(false)
        return
      }
    }

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage(error.message)
      setMessageType('error')
      setLoading(false)
      return
    }

    if (data.user) {
      const res = await fetch('/api/profile/ensure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.user.id,
          email: data.user.email,
          full_name: fullName.trim(),
          address: address.trim(),
          city: city.trim(),
          state: stateProvince.trim(),
          country: country.trim(),
          document_type: documentType,
          document_number: documentNumber.trim(),
          profession: profession.trim(),
        }),
      })

      if (!res.ok) {
        const resData = await res.json().catch(() => null)
        setMessage(resData?.error || 'Se creó la cuenta, pero no se pudo guardar el perfil.')
        setMessageType('error')
        setLoading(false)
        return
      }

      setMessage('¡Cuenta creada! Te enviamos un email de confirmación. Revisá tu bandeja de entrada antes de iniciar sesión.')
      setMessageType('success')
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: '1.5px solid rgba(74,124,63,0.3)',
    background: 'rgba(255,255,255,0.7)',
    color: '#2C2C2C',
    fontSize: '0.9rem',
    fontFamily: 'Georgia, serif',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontSize: '0.8rem',
    color: '#4A7C3F',
    letterSpacing: '0.05em',
    display: 'block' as const,
    marginBottom: '0.4rem',
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #F5F2E8 0%, #EDE8D5 100%)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        fontFamily: 'Georgia, serif',
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(74,124,63,0.2)',
            borderRadius: '1.5rem',
            padding: '2.5rem 2rem',
            boxShadow: '0 8px 40px rgba(74,124,63,0.08)',
          }}
        >
          <h1 style={{ fontSize: '1.75rem', fontWeight: '400', color: '#2D5A27', marginBottom: '0.5rem', textAlign: 'center' }}>
            Crear cuenta
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#5C5C4A', textAlign: 'center', marginBottom: '2rem' }}>
            Completá tus datos para registrarte
          </p>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8B6914', borderBottom: '1px solid rgba(139,105,20,0.2)', paddingBottom: '0.5rem' }}>
              Datos personales
            </p>

            <div>
              <label style={labelStyle}>Nombre completo</label>
              <input type="text" placeholder="Juan Pérez" value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Ciudad</label>
                <input type="text" placeholder="Buenos Aires" value={city} onChange={(e) => setCity(e.target.value)} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Provincia / Estado</label>
                <input type="text" placeholder="CABA" value={stateProvince} onChange={(e) => setStateProvince(e.target.value)} style={inputStyle} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>País</label>
                <input type="text" placeholder="Argentina" value={country} onChange={(e) => setCountry(e.target.value)} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Profesión</label>
                <input type="text" placeholder="Cocinero/a" value={profession} onChange={(e) => setProfession(e.target.value)} style={inputStyle} required />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Dirección</label>
              <input type="text" placeholder="Av. Corrientes 1234" value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Tipo de documento</label>
                <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} style={inputStyle} required>
                  <option value="dni">DNI</option>
                  <option value="national_id">National ID</option>
                  <option value="passport">Pasaporte</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Número de documento</label>
                <input type="text" placeholder="12345678" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} style={inputStyle} required />
              </div>
            </div>

            <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8B6914', borderBottom: '1px solid rgba(139,105,20,0.2)', paddingBottom: '0.5rem', marginTop: '0.5rem' }}>
              Datos de acceso
            </p>

            <div>
              <label style={labelStyle}>Correo electrónico</label>
              <input type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>Contraseña</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
            </div>

            {message && (
              <div style={{ background: messageType === 'success' ? 'rgba(74,124,63,0.1)' : 'rgba(180,60,40,0.08)', border: `1px solid ${messageType === 'success' ? 'rgba(74,124,63,0.3)' : 'rgba(180,60,40,0.2)'}`, borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.875rem', color: messageType === 'success' ? '#2D5A27' : '#8B2500' }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: '0.5rem', padding: '0.875rem', borderRadius: '999px', background: loading ? '#7aaa6f' : '#4A7C3F', color: '#F5F2E8', fontSize: '1rem', fontFamily: 'Georgia, serif', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.03em', boxShadow: '0 4px 16px rgba(74,124,63,0.2)' }}
            >
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#5C5C4A' }}>
            ¿Ya tenés cuenta?{' '}
            <a href="/login" style={{ color: '#4A7C3F', textDecoration: 'none', fontWeight: 'bold' }}>Iniciar sesión</a>
          </p>
        </div>
      </div>
    </main>
  )
}
