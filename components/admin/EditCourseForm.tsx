'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  published: boolean
  cover_image_url?: string | null
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

export default function EditCourseForm({ course }: { course: Course }) {
  const router = useRouter()

  const [title, setTitle] = useState(course.title)
  const [slug, setSlug] = useState(course.slug)
  const [description, setDescription] = useState(course.description || '')
  const [price, setPrice] = useState(String(course.price))
  const [published, setPublished] = useState(course.published)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  async function uploadCoverImage(file: File): Promise<string | null> {
    const supabase = createClient()
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

    let coverImageUrl: string | null = course.cover_image_url || null

    if (coverFile) {
      const uploaded = await uploadCoverImage(coverFile)
      if (!uploaded) {
        setLoading(false)
        return
      }
      coverImageUrl = uploaded
    }

    const authHeaders = await getAuthHeaders()
    const res = await fetch('/api/admin/courses/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        courseId: course.id,
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
      alert(data.error || 'Error al actualizar curso')
      setLoading(false)
      return
    }

    router.push('/admin/cursos')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
        required
      />

      <input
        type="text"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
        required
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="min-h-27.5 w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
      />

      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
        min="0"
        required
      />

      <div className="space-y-2 rounded-2xl border border-white/20 bg-black p-4">
        <p className="text-sm font-medium text-white">Imagen de portada del curso</p>

        {course.cover_image_url && !coverFile && (
          <img
            src={course.cover_image_url}
            alt={course.title}
            className="h-40 w-full rounded-2xl border border-white/10 object-cover"
          />
        )}

        {coverFile && (
          <img
            src={URL.createObjectURL(coverFile)}
            alt="Preview"
            className="h-40 w-full rounded-2xl border border-white/10 object-cover"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          className="w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white file:mr-3 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-black"
        />
        <p className="text-xs text-gray-400">
          {coverFile ? `Nueva imagen: ${coverFile.name}` : 'Subí una nueva imagen para reemplazar la actual'}
        </p>
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
        {loading ? 'Guardando cambios...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
