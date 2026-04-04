'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type LessonItem = {
  id: string
  title: string
  moduleTitle: string
  slug: string
  locked: boolean
  completed: boolean
}

export default function CourseSearch({ lessons }: { lessons: LessonItem[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (!q) return []

    return lessons.filter((lesson) => {
      return (
        lesson.title.toLowerCase().includes(q) ||
        lesson.moduleTitle.toLowerCase().includes(q)
      )
    })
  }, [lessons, query])

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4">
        <p className="text-sm uppercase tracking-wide text-gray-400">
          Buscar dentro del curso
        </p>
        <h2 className="mt-1 text-2xl font-semibold">Buscador</h2>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar lecciones o módulos..."
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-gray-500"
      />

      {query.trim() !== '' && (
        <div className="mt-4 space-y-3">
          {filtered.length > 0 ? (
            filtered.map((lesson) => (
              <div
                key={lesson.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div>
                  <p className="text-sm text-gray-400">{lesson.moduleTitle}</p>
                  <h3 className="font-medium text-white">{lesson.title}</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {lesson.completed
                      ? 'Completada'
                      : lesson.locked
                      ? 'Bloqueada'
                      : 'Disponible'}
                  </p>
                </div>

                {lesson.locked ? (
                  <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400">
                    🔒 Bloqueada
                  </span>
                ) : (
                  <Link
                    href={`/curso/${lesson.slug}/leccion/${lesson.id}`}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
                  >
                    Ir a la lección
                  </Link>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">
              No se encontraron resultados.
            </p>
          )}
        </div>
      )}
    </section>
  )
}