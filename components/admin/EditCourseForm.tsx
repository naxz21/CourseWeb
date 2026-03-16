'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  published: boolean
}

export default function EditCourseForm({ course }: { course: Course }) {
  const router = useRouter()

  const [title, setTitle] = useState(course.title)
  const [slug, setSlug] = useState(course.slug)
  const [description, setDescription] = useState(course.description || '')
  const [price, setPrice] = useState(String(course.price))
  const [published, setPublished] = useState(course.published)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/admin/courses/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: course.id,
        title,
        slug,
        description,
        price: Number(price),
        published,
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