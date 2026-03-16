'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Course = {
  id: string
  title: string
}

type Module = {
  id: string
  course_id: string
  title: string
  description: string | null
  position: number
}

export default function EditModuleForm({
  module,
  courses,
}: {
  module: Module
  courses: Course[]
}) {
  const router = useRouter()

  const [courseId, setCourseId] = useState(module.course_id)
  const [title, setTitle] = useState(module.title)
  const [description, setDescription] = useState(module.description || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/admin/modules/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleId: module.id,
        courseId,
        title,
        description,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Error al actualizar módulo')
      setLoading(false)
      return
    }

    router.push('/admin/modulos')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <select
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white outline-none"
        required
      >
        {courses.map((course) => (
          <option key={course.id} value={course.id} className="bg-black text-white">
            {course.title}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
        required
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="min-h-27.5 w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
      />

      <div className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-sm text-gray-300">
        La posición actual es <strong className="text-white">{module.position}</strong>.
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
