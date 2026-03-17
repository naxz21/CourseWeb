import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditLessonForm from '@/components/admin/EditLessonForm'

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: lesson } = await supabase
    .from('lessons')
    .select(`
      id,
      module_id,
      title,
      lesson_type,
      content,
      cover_image_url,
      cover_storage_bucket,
      cover_storage_path,
      position,
      lesson_assets (
        id,
        asset_type,
        title,
        file_url,
        position
      )
    `)
    .eq('id', id)
    .single()

  if (!lesson) {
    notFound()
  }

  const { data: modules } = await supabase
    .from('modules')
    .select(`
      id,
      title,
      courses (
        title
      )
    `)
    .order('title', { ascending: true })

  return (
    <main className="space-y-8 p-8 text-white">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Editar lección</h1>
          <p className="mt-1 text-gray-400">
            Modificá el contenido principal, la portada y los archivos.
          </p>
        </div>

        <Link
          href="/admin/lecciones"
          className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
        >
          ← Volver a lecciones
        </Link>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <EditLessonForm lesson={lesson as any} modules={modules || []} />
      </div>
    </main>
  )
}