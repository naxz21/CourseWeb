import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BuyButton from '@/components/BuyButton'

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
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
            </div>

            {!hasAccess && (
              <div className="shrink-0">
                <BuyButton courseId={course.id} title={''} price={0} userEmail={''} userId={''} />
              </div>
            )}
          </div>
        </section>

        {hasAccess ? (
          modules && modules.length > 0 ? (
            <div className="space-y-8">
              {[...modules]
                .sort((a: any, b: any) => a.position - b.position)
                .map((module: any) => (
                  <section
                    key={module.id}
                    className="rounded-3xl border border-white/10 bg-white/5 p-6"
                  >
                    <div className="mb-6">
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

                    {module.lessons && module.lessons.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {[...module.lessons]
                          .sort((a: any, b: any) => a.position - b.position)
                          .map((lesson: any) => (
                            <Link
                              key={lesson.id}
                              href={`/curso/${slug}/leccion/${lesson.id}`}
                              className="group overflow-hidden rounded-3xl border border-white/10 bg-black/20 transition hover:scale-[1.01] hover:border-green-400/30 hover:bg-white/10"
                            >
                              {lesson.cover_image_url ? (
                                <img
                                  src={lesson.cover_image_url}
                                  alt={lesson.title}
                                  className="h-48 w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-48 w-full items-center justify-center bg-white/5 text-gray-400">
                                  Sin imagen
                                </div>
                              )}

                              <div className="p-5">
                                <h3 className="text-lg font-semibold text-white transition group-hover:text-green-300">
                                  {lesson.title}
                                </h3>

                                {lesson.content && (
                                  <p className="mt-2 text-sm text-gray-300">
                                    {lesson.content}
                                  </p>
                                )}

                                <div className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition group-hover:bg-green-300">
                                  Ver lección
                                </div>
                              </div>
                            </Link>
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">
                        Este módulo todavía no tiene lecciones.
                      </p>
                    )}
                  </section>
                ))}
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