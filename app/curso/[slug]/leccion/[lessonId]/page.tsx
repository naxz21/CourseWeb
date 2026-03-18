import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import LessonProgressControls from '@/components/LessonProgressControls'

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>
}) {
  const { slug, lessonId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('id, title, slug')
    .eq('slug', slug)
    .maybeSingle()

  if (!course) {
    return <main className="p-8 text-white">Curso no encontrado</main>
  }

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!enrollment) {
    return (
      <main className="min-h-screen bg-black p-8 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-6">
          <p className="text-yellow-200">
            Tenés que comprar el curso para acceder a esta lección.
          </p>

          <Link
            href={`/curso/${slug}`}
            className="mt-4 inline-block rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Volver al curso
          </Link>
        </div>
      </main>
    )
  }

  const { data: lesson } = await supabaseAdmin
    .from('lessons')
    .select('id, module_id, title, content, position, cover_image_url')
    .eq('id', lessonId)
    .maybeSingle()

  if (!lesson) {
    return (
      <main className="p-8 text-white">
        <p>❌ Lección no encontrada</p>
        <p className="mt-2 text-sm text-red-300">lessonId: {lessonId}</p>
        <p className="text-sm text-red-300">slug: {slug}</p>
      </main>
    )
  }

  const { data: moduleData } = await supabaseAdmin
    .from('modules')
    .select('id, title, course_id, position')
    .eq('id', lesson.module_id)
    .maybeSingle()

  if (!moduleData) {
    return <main className="p-8 text-white">Módulo no encontrado</main>
  }

  if (moduleData.course_id !== course.id) {
    notFound()
  }

  const { data: modules } = await supabaseAdmin
    .from('modules')
    .select('id, title, position')
    .eq('course_id', course.id)
    .order('position', { ascending: true })

  const moduleIds = (modules || []).map((m) => m.id)

  const { data: allLessons } = await supabaseAdmin
    .from('lessons')
    .select('id, module_id, title, position')
    .in(
      'module_id',
      moduleIds.length > 0
        ? moduleIds
        : ['00000000-0000-0000-0000-000000000000']
    )
    .order('position', { ascending: true })

  const orderedLessons =
    modules?.flatMap((module) =>
      (allLessons || [])
        .filter((l) => l.module_id === module.id)
        .sort((a, b) => a.position - b.position)
        .map((l) => ({
          ...l,
          moduleTitle: module.title,
          modulePosition: module.position,
        }))
    ) || []

  const currentIndex = orderedLessons.findIndex((l) => l.id === lesson.id)
  const previousLesson = currentIndex > 0 ? orderedLessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex >= 0 && currentIndex < orderedLessons.length - 1
      ? orderedLessons[currentIndex + 1]
      : null

  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('lesson_id, completed, last_viewed_at')
    .eq('user_id', user.id)
    .eq('course_id', course.id)

  const progressMap = new Map(
    (progress || []).map((item) => [item.lesson_id, item])
  )

  const currentProgress = progressMap.get(lesson.id)
  const isCompleted = !!currentProgress?.completed

  const totalLessons = orderedLessons.length
  const completedLessons = orderedLessons.filter((item) =>
    progressMap.get(item.id)?.completed
  ).length

  const progressPercent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  const { data: assets } = await supabaseAdmin
    .from('lesson_assets')
    .select('id, asset_type, title, file_url, position')
    .eq('lesson_id', lesson.id)
    .order('position', { ascending: true })

  const safeAssets = assets || []
  const pdfs = safeAssets.filter((a: any) => a.asset_type === 'pdf')
  const videos = safeAssets.filter((a: any) => a.asset_type === 'video')
  const images = safeAssets.filter((a: any) => a.asset_type === 'image')

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/curso/${slug}`}
            className="inline-block rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
          >
            ← Volver
          </Link>

          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
            Progreso del curso: {completedLessons}/{totalLessons} ({progressPercent}
            %)
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          {lesson.cover_image_url && (
            <img
              src={lesson.cover_image_url}
              alt={lesson.title}
              className="h-72 w-full object-cover"
            />
          )}

          <div className="p-6">
            <p className="text-sm text-gray-400">
              {moduleData.title || 'Lección'}
            </p>

            <h1 className="mt-2 text-3xl font-bold">{lesson.title}</h1>

            <div className="mt-4">
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-5">
              <LessonProgressControls
                courseId={course.id}
                moduleId={lesson.module_id}
                lessonId={lesson.id}
                initialCompleted={isCompleted}
              />
            </div>

            {lesson.content && (
              <p className="mt-6 whitespace-pre-line text-gray-300">
                {lesson.content}
              </p>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="mb-2 text-sm text-gray-400">Lección anterior</p>

            {previousLesson ? (
              <Link
                href={`/curso/${slug}/leccion/${previousLesson.id}`}
                className="inline-block rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
              >
                ← {previousLesson.title}
              </Link>
            ) : (
              <p className="text-sm text-gray-500">Esta es la primera lección</p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="mb-2 text-sm text-gray-400">Lección siguiente</p>

            {nextLesson ? (
              <Link
                href={`/curso/${slug}/leccion/${nextLesson.id}`}
                className="inline-block rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
              >
                {nextLesson.title} →
              </Link>
            ) : (
              <p className="text-sm text-gray-500">Esta es la última lección</p>
            )}
          </div>
        </section>

        {videos.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Videos</h2>

            {videos.map((v: any) => (
              <div
                key={v.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <p className="mb-3 text-sm font-medium text-white">
                  {v.title || 'Video'}
                </p>

                <video
                  controls
                  className="w-full rounded-2xl"
                  src={v.file_url}
                />
              </div>
            ))}
          </section>
        )}

        {pdfs.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">PDFs</h2>

            {pdfs.map((p: any) => (
              <div
                key={p.id}
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <p className="mb-4 text-sm font-medium text-white">
                  {p.title || 'PDF'}
                </p>

                <div className="mb-4 flex flex-wrap gap-3">
                  <a
                    href={p.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
                  >
                    Abrir PDF
                  </a>

                  <a
                    href={p.file_url}
                    download
                    className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white"
                  >
                    Descargar
                  </a>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white">
                  <iframe
                    src={p.file_url}
                    title={p.title || 'PDF'}
                    className="h-200 w-full"
                  />
                </div>

                <p className="mt-3 text-xs text-gray-400">
                  Si no se visualiza dentro de la página, usá “Abrir PDF”.
                </p>
              </div>
            ))}
          </section>
        )}

        {images.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Imágenes</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {images.map((img: any) => (
                <div
                  key={img.id}
                  className="rounded-2xl border border-white/10 bg-black/20 p-3"
                >
                  <p className="mb-3 text-sm font-medium text-white">
                    {img.title || 'Imagen'}
                  </p>

                  <img
                    src={img.file_url}
                    alt={img.title || lesson.title}
                    className="w-full rounded-2xl"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {safeAssets.length === 0 && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-gray-400">
              Esta lección todavía no tiene archivos cargados.
            </p>
          </section>
        )}
      </div>
    </main>
  )
}