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

export default function CreateCourseForm() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [published, setPublished] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  async function uploadCoverImage(file: File): Promise<string | null> {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    const ext = file.name.split('.').pop()
    const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from('course-covers')
      .upload(path, file, { contentType: file.type, upsert: false })

    if (error) {
      alert('Error al subir imagen: ' + error.message)
      return null
    }

    const { data } = supabase.storage.from('course-covers').getPublicUrl(path)
    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let coverImageUrl: string | null = null

    if (coverFile) {
      coverImageUrl = await uploadCoverImage(coverFile)
      if (!coverImageUrl) {
        setLoading(false)
        return
      }
    }

    const authHeaders = await getAuthHeaders()
    const res = await fetch('/api/admin/courses/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        title,
        slug,
        description,
        price: Number(price),
        published,
        cover_image_url: coverImageUrl,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Error al crear curso')
      setLoading(false)
      return
    }

    setTitle('')
    setSlug('')
    setDescription('')
    setPrice('')
    setPublished(false)
    setCoverFile(null)
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
        required
      />

      <input
        type="text"
        placeholder="Slug (ej: curso-alimentacion)"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
        required
      />

      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="min-h-27.5 w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
      />

      <input
        type="number"
        placeholder="Precio"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
        min="0"
        required
      />

      <div className="space-y-2 rounded-2xl border border-white/20 bg-black p-4">
        <p className="text-sm font-medium text-white">Imagen de portada del curso</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          className="w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white file:mr-3 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-black"
        />
        {coverFile && (
          <p className="text-xs text-gray-400">{coverFile.name}</p>
        )}
      </div>

      <label className="flex items-center gap-2 text-white">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        Publicado
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Creando curso...' : 'Crear curso'}
      </button>
    </form>
  )
}
