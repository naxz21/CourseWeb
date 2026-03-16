'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Module = {
  id: string
  title: string
  courses?: { title: string } | { title: string }[]
}

type Lesson = {
  id: string
  module_id: string
  title: string
  lesson_type: string
  content: string | null
  video_url: string | null
  pdf_url: string | null
  image_url: string | null
  position: number
}

export default function EditLessonForm({
  lesson,
  modules,
}: {
  lesson: Lesson
  modules: Module[]
}) {
  const router = useRouter()

  const [moduleId, setModuleId] = useState(lesson.module_id)
  const [title, setTitle] = useState(lesson.title)
  const [lessonType, setLessonType] = useState(lesson.lesson_type)
  const [content, setContent] = useState(lesson.content || '')
  const [videoUrl, setVideoUrl] = useState(lesson.video_url || '')
  const [pdfUrl, setPdfUrl] = useState(lesson.pdf_url || '')
  const [imageUrl, setImageUrl] = useState(lesson.image_url || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/admin/lessons/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId: lesson.id,
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
      alert(data.error || 'Error al actualizar lección')
      setLoading(false)
      return
    }

    router.push('/admin/lecciones')
    router.refresh()
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
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-27.5 w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
      />

      <input
        type="text"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
      />

      <input
        type="text"
        value={pdfUrl}
        onChange={(e) => setPdfUrl(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
      />

      <input
        type="text"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
      />

      <div className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-sm text-gray-300">
        La posición actual es <strong className="text-white">{lesson.position}</strong>.
      </div>

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

