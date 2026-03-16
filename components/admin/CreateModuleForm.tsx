'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Course = {
  id: string
  title: string
}

type Module = {
  id: string
  title: string
  course_id: string
  position: number
}

export default function CreateModuleForm({
  courses,
  existingModules = [],
}: {
  courses: Course[]
  existingModules?: Module[]
}) {
  const router = useRouter()

  const [courseId, setCourseId] = useState(courses[0]?.id || '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const nextPosition = useMemo(() => {
    const modulesOfCourse = existingModules.filter(
      (module) => module.course_id === courseId
    )

    if (modulesOfCourse.length === 0) return 1

    return (
      Math.max(...modulesOfCourse.map((module) => Number(module.position) || 0)) + 1
    )
  }, [existingModules, courseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/admin/modules/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId,
        title,
        description,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || 'Error al crear módulo')
      setLoading(false)
      return
    }

    setTitle('')
    setDescription('')
    router.refresh()
    setLoading(false)
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
        placeholder="Título del módulo"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
        required
      />

      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="min-h-27.5 w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
      />

      <div className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-sm text-gray-300">
        Posición asignada automáticamente: <strong className="text-white">{nextPosition}</strong>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Creando módulo...' : 'Crear módulo'}
      </button>
    </form>
  )
}