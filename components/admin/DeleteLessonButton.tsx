'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

async function parseJsonSafely(res: Response) {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(text || 'El servidor devolvió una respuesta inválida')
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

export default function DeleteLessonButton({ lessonId }: { lessonId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm('¿Seguro que querés eliminar esta lección?')
    if (!confirmed) return

    setLoading(true)

    try {
      const authHeaders = await getAuthHeaders()
      const res = await fetch('/api/admin/lessons/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ lessonId }),
      })

      const data = await parseJsonSafely(res)

      if (!res.ok) {
        throw new Error(data.error || 'Error al eliminar lección')
      }

      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al eliminar lección')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20 disabled:opacity-60"
    >
      {loading ? 'Eliminando...' : 'Eliminar'}
    </button>
  )
}
