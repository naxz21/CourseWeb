'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

export default function MoveModuleButtons({ moduleId }: { moduleId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<'up' | 'down' | null>(null)

  const move = async (direction: 'up' | 'down') => {
    setLoading(direction)
    const authHeaders = await getAuthHeaders()
    const res = await fetch('/api/admin/modules/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ moduleId, direction }),
    })
    const data = await res.json()
    if (!res.ok) { alert(data.error || 'Error al mover módulo'); setLoading(null); return }
    router.refresh()
    setLoading(null)
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <button
        type="button"
        onClick={() => move('up')}
        disabled={loading !== null}
        style={{ padding: '0.4rem 0.9rem', borderRadius: '999px', border: '1.5px solid rgba(74,124,63,0.4)', color: '#4A7C3F', background: 'transparent', fontSize: '0.8rem', cursor: loading !== null ? 'not-allowed' : 'pointer', opacity: loading !== null ? 0.6 : 1, fontFamily: 'Georgia, serif' }}
      >
        {loading === 'up' ? '...' : '↑'}
      </button>
      <button
        type="button"
        onClick={() => move('down')}
        disabled={loading !== null}
        style={{ padding: '0.4rem 0.9rem', borderRadius: '999px', border: '1.5px solid rgba(74,124,63,0.4)', color: '#4A7C3F', background: 'transparent', fontSize: '0.8rem', cursor: loading !== null ? 'not-allowed' : 'pointer', opacity: loading !== null ? 0.6 : 1, fontFamily: 'Georgia, serif' }}
      >
        {loading === 'down' ? '...' : '↓'}
      </button>
    </div>
  )
}
