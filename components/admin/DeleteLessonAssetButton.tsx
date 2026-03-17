'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

async function parseJsonSafely(res: Response) {
  const text = await res.text()

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(text || 'El servidor devolvió una respuesta inválida')
  }
}

export default function DeleteLessonAssetButton({
  assetId,
}: {
  assetId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm('¿Eliminar este archivo?')
    if (!confirmed) return

    setLoading(true)

    try {
      const res = await fetch('/api/admin/lesson-assets/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId }),
      })

      const data = await parseJsonSafely(res)

      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar archivo')
      }

      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al eliminar archivo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 hover:bg-red-500/20 disabled:opacity-60"
    >
      {loading ? 'Eliminando...' : 'Eliminar'}
    </button>
  )
}