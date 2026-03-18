'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  courseId: string
  moduleId: string
  lessonId: string
  initialCompleted: boolean
}

export default function LessonProgressControls({
  courseId,
  moduleId,
  lessonId,
  initialCompleted,
}: Props) {
  const router = useRouter()
  const [completed, setCompleted] = useState(initialCompleted)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const markViewed = async () => {
      try {
        await fetch('/api/lesson-progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseId,
            moduleId,
            lessonId,
            action: 'view',
          }),
        })
      } catch (error) {
        console.error('Error registrando vista', error)
      }
    }

    markViewed()
  }, [courseId, moduleId, lessonId])

  const handleToggleComplete = () => {
    const nextValue = !completed

    startTransition(async () => {
      try {
        const res = await fetch('/api/lesson-progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courseId,
            moduleId,
            lessonId,
            action: 'complete',
            completed: nextValue,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          console.error(data)
          alert(data.error || 'No se pudo guardar el progreso')
          return
        }

        setCompleted(nextValue)
        router.refresh()
      } catch (error) {
        console.error(error)
        alert('Error al actualizar el progreso')
      }
    })
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handleToggleComplete}
        disabled={isPending}
        className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
          completed
            ? 'bg-green-600 text-white hover:bg-green-500'
            : 'bg-white text-black hover:bg-gray-200'
        } disabled:opacity-60`}
      >
        {isPending
          ? 'Guardando...'
          : completed
          ? '✓ Lección completada'
          : 'Marcar como completada'}
      </button>
    </div>
  )
}