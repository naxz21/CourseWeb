'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const res = await fetch('/auth/logout', { method: 'POST' })
      if (!res.ok) { alert('No se pudo cerrar sesión'); return }
      router.push('/')
      router.refresh()
    } catch (error) {
      alert('Error al cerrar sesión')
    }
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '0.5rem 1.25rem',
        borderRadius: '999px',
        border: '1.5px solid rgba(74,124,63,0.4)',
        color: '#4A7C3F',
        fontSize: '0.875rem',
        fontFamily: 'Georgia, serif',
        background: 'transparent',
        cursor: 'pointer',
        letterSpacing: '0.02em',
      }}
    >
      Cerrar sesión
    </button>
  )
}
