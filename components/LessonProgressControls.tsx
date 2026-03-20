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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId, moduleId, lessonId, action: 'view' }),
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId, moduleId, lessonId, action: 'complete', completed: nextValue }),
        })
        const data = await res.json()
        if (!res.ok) { alert(data.error || 'No se pudo guardar el progreso'); return }
        setCompleted(nextValue)
        router.refresh()
      } catch (error) {
        alert('Error al actualizar el progreso')
      }
    })
  }

  return (
    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(74,124,63,0.15)', display: 'flex', justifyContent: 'center' }}>
      <button
        type="button"
        onClick={handleToggleComplete}
        disabled={isPending}
        style={{
          padding: '1rem 3rem',
          borderRadius: '999px',
          fontSize: '1rem',
          fontFamily: 'Georgia, serif',
          fontWeight: '400',
          letterSpacing: '0.03em',
          cursor: isPending ? 'not-allowed' : 'pointer',
          opacity: isPending ? 0.7 : 1,
          transition: 'all 0.2s',
          border: 'none',
          background: completed ? '#4A7C3F' : 'transparent',
          color: completed ? '#F5F2E8' : '#4A7C3F',
          outline: completed ? 'none' : '2px solid #4A7C3F',
          boxShadow: completed ? '0 4px 20px rgba(74,124,63,0.25)' : 'none',
        }}
      >
        {isPending ? 'Guardando...' : completed ? '✓ Lección completada' : 'Marcar como completada'}
      </button>
    </div>
  )
}
