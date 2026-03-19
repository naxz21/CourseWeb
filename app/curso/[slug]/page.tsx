import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BuyButton from '@/components/BuyButton'
import CourseSearch from '@/components/CourseSearch'

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (courseError || !course) {
    return <main className="p-8 text-white">Curso no encontrado</main>
  }

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .eq('status', 'active')
    .maybeSingle()

  const { data: modules } = await supabase
    .from('modules')
    .select(`
      id,
      title,
      description,
      position,
      lessons (
        id,
        title,
        content,
        position,
        cover_image_url
      )
    `)
    .eq('course_id', course.id)
    .order('position', { ascending: true })

  const hasAccess = !!enrollment

  let progressMap = new Map<
    string,
    {
      lesson_id: string
      completed: boolean
      last_viewed_at: string | null
    }
  >()

  if (hasAccess) {
    const { data: progressRows } = await supabase
      .from('lesson_progress')
      .select('lesson_id, completed, last_viewed_at')
      .eq('user_id', user.id)
      .eq('course_id', course.id)

    progressMap = new Map(
      (progressRows || []).map((item: any) => [item.lesson_id, item])
    )
  }

  const safeModules = [...(modules || [])].sort(
    (a: any, b: any) => a.position - b.position
  )

  const flatLessons = safeModules.flatMap((module: any) =>
    [...(module.lessons || [])]
      .sort((a: any, b: any) => a.position - b.position)
      .map((lesson: any) => ({
        ...lesson,
        moduleId: module.id,
        moduleTitle: module.title,
        modulePosition: module.position,
      }))
  )

  const unlockedLessonIds = new Set<string>()

  flatLessons.forEach((lesson: any, index: number) => {
    if (index === 0) {
      unlockedLessonIds.add(lesson.id)
      return
    }

    const prevLesson = flatLessons[index - 1]
    const prevCompleted = !!progressMap.get(prevLesson.id)?.completed

    if (prevCompleted) {
      unlockedLessonIds.add(lesson.id)
    }
  })

  const totalLessons = flatLessons.length
  const completedLessons = flatLessons.filter(
    (lesson: any) => progressMap.get(lesson.id)?.completed
  ).length
  const courseProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const lastViewedUncompleted = flatLessons.find((lesson: any) => {
    const row = progressMap.get(lesson.id)
    return !!row?.last_viewed_at && !row?.completed
  })

  const latestViewed = [...progressMap.values()]
    .filter((row: any) => row.last_viewed_at)
    .sort(
      (a: any, b: any) =>
        new Date(b.last_viewed_at || 0).getTime() -
        new Date(a.last_viewed_at || 0).getTime()
    )[0]

  const continueLesson =
    flatLessons.find((lesson: any) => lesson.id === lastViewedUncompleted?.id) ||
    flatLessons.find(
      (lesson: any) =>
        latestViewed?.lesson_id === lesson.id && !progressMap.get(lesson.id)?.completed
    ) ||
    flatLessons.find((lesson: any) => !progressMap.get(lesson.id)?.completed) ||
    flatLessons[0]

  const searchLessons = flatLessons.map((lesson: any) => ({
    id: lesson.id,
    title: lesson.title,
    moduleTitle: lesson.moduleTitle,
    slug,
    locked: hasAccess ? !unlockedLessonIds.has(lesson.id) : true,
    completed: !!progressMap.get(lesson.id)?.completed,
  }))

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
          >
            ← Volver al dashboard
          </Link>
        </div>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-wide text-green-300">
                Curso
              </p>

              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                {course.title}
              </h1>

              {course.description && (
                <p className="mt-4 text-gray-300">{course.description}</p>
              )}

              {hasAccess && totalLessons > 0 && (
                <div className="mt-6 max-w-xl">
                  <div className="mb-2 flex items-center justify-between text-sm text-gray-300">
                    <span>Progreso general</span>
                    <span>
                      {completedLessons}/{totalLessons} · {courseProgress}%
                    </span>
                  </div>

                  <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-green-400"
                      style={{ width: `${courseProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {!hasAccess && (
              <div className="shrink-0">
            <BuyButton
  courseId={course.id}
  title={course.title}
  price={course.price}
  userEmail={user.email ?? ''}
  userId={user.id}
/>
              </div>
            )}
          </div>
        </section>

        {hasAccess && continueLesson && (
          <section className="rounded-3xl border border-green-400/20 bg-green-400/10 p-6">
            <p className="text-sm uppercase tracking-wide text-green-300">
              Continuar donde lo dejaste
            </p>

            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-green-200">{continueLesson.moduleTitle}</p>
                <h2 className="text-2xl font-semibold text-white">
                  {continueLesson.title}
                </h2>
              </div>

              <Link
                href={`/curso/${slug}/leccion/${continueLesson.id}`}
                className="inline-flex rounded-xl bg-white px-5 py-3 text-sm font-medium text-black"
              >
                Continuar
              </Link>
            </div>
          </section>
        )}

        {hasAccess && flatLessons.length > 0 && (
          <CourseSearch lessons={searchLessons} />
        )}

        {hasAccess ? (
          safeModules.length > 0 ? (
            <div className="space-y-8">
              {safeModules.map((module: any) => {
                const moduleLessons = [...(module.lessons || [])].sort(
                  (a: any, b: any) => a.position - b.position
                )

                const moduleCompleted = moduleLessons.filter(
                  (lesson: any) => progressMap.get(lesson.id)?.completed
                ).length

                const moduleProgress =
                  moduleLessons.length > 0
                    ? Math.round((moduleCompleted / moduleLessons.length) * 100)
                    : 0

                const isModuleUnlocked =
                  moduleLessons.length === 0 ||
                  moduleLessons.some((lesson: any) =>
                    unlockedLessonIds.has(lesson.id)
                  )

                return (
                  <section
                    key={module.id}
                    className={`rounded-3xl border p-6 ${
                      isModuleUnlocked
                        ? 'border-white/10 bg-white/5'
                        : 'border-white/5 bg-white/3'
                    }`}
                  >
                    <div className="mb-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-sm uppercase tracking-wide text-gray-400">
                            Módulo
                          </p>
                          <h2 className="mt-1 text-2xl font-semibold">
                            {module.title}
                          </h2>

                          {module.description && (
                            <p className="mt-2 text-gray-300">
                              {module.description}
                            </p>
                          )}
                        </div>

                        <div className="min-w-55">
                          <div className="mb-2 flex items-center justify-between text-sm text-gray-300">
                            <span>Progreso</span>
                            <span>
                              {moduleCompleted}/{moduleLessons.length} ·{' '}
                              {moduleProgress}%
                            </span>
                          </div>

                          <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-green-400"
                              style={{ width: `${moduleProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {moduleLessons.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {moduleLessons.map((lesson: any) => {
                          const completed = !!progressMap.get(lesson.id)?.completed
                          const locked = !unlockedLessonIds.has(lesson.id)

                          return (
                            <div
                              key={lesson.id}
                              className={`group overflow-hidden rounded-3xl border transition ${
                                locked
                                  ? 'border-white/5 bg-black/10 opacity-60'
                                  : completed
                                  ? 'border-green-400/30 bg-green-400/5 hover:scale-[1.01] hover:border-green-400/50'
                                  : 'border-white/10 bg-black/20 hover:scale-[1.01] hover:border-green-400/30 hover:bg-white/10'
                              }`}
                            >
                              {lesson.cover_image_url ? (
                                <img
                                  src={lesson.cover_image_url}
                                  alt={lesson.title}
                                  className="h-48 w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-48 w-full items-center justify-center bg-white/5 text-gray-400">
                                  {locked ? '🔒 Bloqueada' : 'Sin imagen'}
                                </div>
                              )}

                              <div className="p-5">
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                  {completed && (
                                    <span className="rounded-full bg-green-400/20 px-3 py-1 text-xs font-medium text-green-300">
                                      ✓ Completada
                                    </span>
                                  )}

                                  {!completed && !locked && (
                                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-300">
                                      Disponible
                                    </span>
                                  )}

                                  {locked && (
                                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-400">
                                      🔒 Bloqueada
                                    </span>
                                  )}
                                </div>

                                <h3
                                  className={`text-lg font-semibold transition ${
                                    locked
                                      ? 'text-gray-400'
                                      : 'text-white group-hover:text-green-300'
                                  }`}
                                >
                                  {lesson.title}
                                </h3>

                                {lesson.content && (
                                  <p className="mt-2 line-clamp-3 text-sm text-gray-300">
                                    {lesson.content}
                                  </p>
                                )}

                                <div className="mt-4">
                                  {locked ? (
                                    <div className="inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-400">
                                      Completá la anterior para desbloquear
                                    </div>
                                  ) : (
                                    <Link
                                      href={`/curso/${slug}/leccion/${lesson.id}`}
                                      className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition group-hover:bg-green-300"
                                    >
                                      {completed ? 'Revisar lección' : 'Ver lección'}
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-400">
                        Este módulo todavía no tiene lecciones.
                      </p>
                    )}
                  </section>
                )
              })}
            </div>
          ) : (
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-gray-400">Este curso todavía no tiene módulos.</p>
            </section>
          )
        ) : (
          <section className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6">
            <h2 className="text-xl font-semibold text-yellow-200">
              Acceso bloqueado
            </h2>
            <p className="mt-2 text-yellow-100">
              Tenés que comprar el curso para ver las lecciones.
            </p>
          </section>
        )}
      </div>
    </main>
  )
}