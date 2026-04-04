'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

export default function DeleteModuleButton({ moduleId }: { moduleId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    const confirmed = window.confirm('¿Seguro que querés eliminar este módulo?')
    if (!confirmed) return

    setLoading(true)

    try {
      const authHeaders = await getAuthHeaders()
      const res = await fetch('/api/admin/modules/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ moduleId }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Error al eliminar módulo')
        return
      }

      router.refresh()
    } catch (error) {
      alert('Error al eliminar módulo')
    } finally {
      setLoading(false)
    }
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
