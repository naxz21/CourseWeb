'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MoveLessonButtons({
  lessonId,
}: {
  lessonId: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<'up' | 'down' | null>(null)

  const move = async (direction: 'up' | 'down') => {
    setLoading(direction)

    const res = await fetch('/api/admin/lessons/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, direction }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Error al mover lección')
      setLoading(null)
      return
    }

    router.refresh()
    setLoading(null)
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => move('up')}
        disabled={loading !== null}
        className="rounded-xl border border-white/40 px-4 py-2 text-white transition hover:bg-white hover:text-black disabled:opacity-50"
      >
        {loading === 'up' ? 'Subiendo...' : '↑ Subir'}
      </button>

      <button
        type="button"
        onClick={() => move('down')}
        disabled={loading !== null}
        className="rounded-xl border border-white/40 px-4 py-2 text-white transition hover:bg-white hover:text-black disabled:opacity-50"
      >
        {loading === 'down' ? 'Bajando...' : '↓ Bajar'}
      </button>
    </div>
  )
}