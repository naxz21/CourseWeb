import { createClient } from '@/lib/supabase/client'

// Llama esto antes de fetch() para obtener el header Authorization
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    return {}
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  }
}