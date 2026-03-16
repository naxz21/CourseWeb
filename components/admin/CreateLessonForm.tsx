'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Module = {
  id: string
  title: string
  courses?: { title: string } | { title: string }[]
}

type Lesson = {
  id: string
  module_id: string
  position: number
}

export default function CreateLessonForm({
  modules,
  existingLessons = [],
}: {
  modules: Module[]
  existingLessons?: Lesson[]
}) {
  const router = useRouter()

  const [moduleId, setModuleId] = useState(modules[0]?.id || '')
  const [title, setTitle] = useState('')
  const [lessonType, setLessonType] = useState('text')
  const [content, setContent] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const nextPosition = useMemo(() => {
    const lessonsOfModule = existingLessons.filter(
      (lesson) => lesson.module_id === moduleId
    )

    if (lessonsOfModule.length === 0) return 1

    return (
      Math.max(...lessonsOfModule.map((lesson) => Number(lesson.position) || 0)) + 1
    )
  }, [existingLessons, moduleId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/admin/lessons/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleId,
        title,
        lessonType,
        content,
        videoUrl,
        pdfUrl,
        imageUrl,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Error al crear lección')
      setLoading(false)
      return
    }

    setTitle('')
    setContent('')
    setVideoUrl('')
    setPdfUrl('')
    setImageUrl('')
    setLessonType('text')
    router.refresh()
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <select
        value={moduleId}
        onChange={(e) => setModuleId(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white outline-none"
        required
      >
        {modules.map((module) => {
          const course = Array.isArray(module.courses)
            ? module.courses[0]
            : module.courses

          return (
            <option key={module.id} value={module.id} className="bg-black text-white">
              {course?.title ? `${course.title} / ${module.title}` : module.title}
            </option>
          )
        })}
      </select>

      <input
        type="text"
        placeholder="Título de la lección"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
        required
      />

      <select
        value={lessonType}
        onChange={(e) => setLessonType(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white outline-none"
      >
        <option value="text" className="bg-black text-white">Texto</option>
        <option value="video" className="bg-black text-white">Video</option>
        <option value="pdf" className="bg-black text-white">PDF</option>
        <option value="image" className="bg-black text-white">Imagen</option>
      </select>

      <textarea
        placeholder="Contenido de texto"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-27.5 w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
      />

      <input
        type="text"
        placeholder="URL del video"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
      />

      <input
        type="text"
        placeholder="URL del PDF"
        value={pdfUrl}
        onChange={(e) => setPdfUrl(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
      />

      <input
        type="text"
        placeholder="URL de la imagen"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
      />

      <div className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-sm text-gray-300">
        Posición asignada automáticamente: <strong className="text-white">{nextPosition}</strong>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Creando lección...' : 'Crear lección'}
      </button>
    </form>
  )
}
