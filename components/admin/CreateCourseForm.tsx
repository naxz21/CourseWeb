'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateCourseForm() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [published, setPublished] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/admin/courses/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        slug,
        description,
        price: Number(price),
        published,
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