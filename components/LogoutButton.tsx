'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const res = await fetch('/auth/logout', {
        method: 'POST',
      })

      if (!res.ok) {
        alert('No se pudo cerrar sesión')
        return
      }

      router.push('/')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Error al cerrar sesión')
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border px-4 py-2"
    >
      Cerrar sesión
    </button>
  )
}