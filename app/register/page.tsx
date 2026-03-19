'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
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
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!fullName.trim()) {
      setMessage('Ingresá tu nombre completo')
      setLoading(false)
      return
    }

    if (!address.trim()) {
      setMessage('Ingresá tu dirección')
      setLoading(false)
      return
    }

    if (!city.trim()) {
      setMessage('Ingresá tu ciudad')
      setLoading(false)
      return
    }

    if (!stateProvince.trim()) {
      setMessage('Ingresá tu provincia/estado')
      setLoading(false)
      return
    }

    if (!country.trim()) {
      setMessage('Ingresá tu país')
      setLoading(false)
      return
    }

    if (!documentNumber.trim()) {
      setMessage('Ingresá tu número de documento')
      setLoading(false)
      return
    }

    if (!profession.trim()) {
      setMessage('Ingresá tu profesión')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // ✅ Ahora pasamos userId y email en el body — la API ya no depende de la sesión
      const res = await fetch('/api/profile/ensure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
      return
    }

    setMessage('Registro realizado. Revisá tu email para confirmar la cuenta.')
    setLoading(false)
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-bold">Registrarse</h1>

      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          required
        />

        <input
          type="text"
          placeholder="Dirección"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          required
        />

        <input
          type="text"
          placeholder="Ciudad"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          required
        />

        <input
          type="text"
          placeholder="Provincia / Estado"
          value={stateProvince}
          onChange={(e) => setStateProvince(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          required
        />

        <input
          type="text"
          placeholder="País"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          required
        />

        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          required
        >
          <option value="dni">DNI</option>
          <option value="national_id">National ID</option>
          <option value="passport">Pasaporte</option>
        </select>

        <input
          type="text"
          placeholder="Número de documento"
          value={documentNumber}
          onChange={(e) => setDocumentNumber(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          required
        />

        <input
          type="text"
          placeholder="Profesión"
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? 'Registrando...' : 'Crear cuenta'}
        </button>

        {message && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {message}
          </p>
        )}
      </form>
    </main>
  )
}