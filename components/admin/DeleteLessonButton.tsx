'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteLessonButton({ lessonId }: { lessonId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    const confirmed = window.confirm('¿Seguro que querés eliminar esta lección?')
    if (!confirmed) return

    setLoading(true)

    const res = await fetch('/api/admin/lessons/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Error al eliminar lección')
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-xl border border-red-500 px-5 py-2 text-red-500 transition hover:bg-red-500 hover:text-white"
    >
      {loading ? 'Eliminando...' : 'Eliminar'}
    </button>
  )
}