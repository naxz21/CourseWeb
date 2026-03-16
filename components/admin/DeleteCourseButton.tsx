'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteCourseButton({ courseId }: { courseId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    const confirmed = window.confirm('¿Seguro que querés eliminar este curso?')
    if (!confirmed) return

    setLoading(true)

    const res = await fetch('/api/admin/courses/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Error al eliminar curso')
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