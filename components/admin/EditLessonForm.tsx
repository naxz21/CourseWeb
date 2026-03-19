'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DeleteLessonAssetButton from '@/components/admin/DeleteLessonAssetButton'

type Module = {
  id: string
  title: string
  courses?: { title: string } | { title: string }[]
}

type Asset = {
  id: string
  asset_type: 'video' | 'pdf' | 'image'
  title: string | null
  file_url: string
  position: number
}

type Lesson = {
  id: string
  module_id: string
  title: string
  lesson_type: string
  content: string | null
  cover_image_url?: string | null
  cover_storage_bucket?: string | null
  cover_storage_path?: string | null
  position: number
  lesson_assets?: Asset[]
}

async function parseJsonSafely(res: Response) {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(text || 'El servidor devolvió una respuesta inválida')
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return {}
  return { Authorization: `Bearer ${session.access_token}` }
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
  const [lessonType, setLessonType] = useState<'mixed' | 'text'>(
    lesson.lesson_type === 'text' ? 'text' : 'mixed'
  )
  const [content, setContent] = useState(lesson.content || '')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  const [videoFiles, setVideoFiles] = useState<File[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  const existingAssets = Array.isArray(lesson.lesson_assets)
    ? [...lesson.lesson_assets].sort((a, b) => a.position - b.position)
    : []

  async function uploadFiles(
    files: File[],
    assetType: 'video' | 'pdf' | 'image' | 'cover',
    lessonId: string
  ) {
    if (!files.length) return []

    const authHeaders = await getAuthHeaders()

    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    formData.append('assetType', assetType)
    formData.append('lessonId', lessonId)

    const res = await fetch('/api/admin/lesson-assets/upload', {
      method: 'POST',
      headers: authHeaders,
      body: formData,
    })

    const data = await parseJsonSafely(res)

    if (!res.ok) {
      throw new Error(data.error || `Error al subir archivos de tipo ${assetType}`)
    }

    return data.files as Array<{
      publicUrl: string
      storageBucket: string
      storagePath: string
      originalName: string
    }>
  }

  async function uploadCover(lessonId: string) {
    if (!coverFile) {
      return {
        coverImageUrl: lesson.cover_image_url || null,
        coverStorageBucket: lesson.cover_storage_bucket || null,
        coverStoragePath: lesson.cover_storage_path || null,
      }
    }

    const data = await uploadFiles([coverFile], 'cover', lessonId)

    return {
      coverImageUrl: data[0]?.publicUrl || null,
      coverStorageBucket: data[0]?.storageBucket || null,
      coverStoragePath: data[0]?.storagePath || null,
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const authHeaders = await getAuthHeaders()

      const cover = await uploadCover(lesson.id)

      const updateRes = await fetch('/api/admin/lessons/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          lessonId: lesson.id,
          moduleId,
          title,
          lessonType,
          content,
          coverImageUrl: cover.coverImageUrl,
          coverStorageBucket: cover.coverStorageBucket,
          coverStoragePath: cover.coverStoragePath,
        }),
      })

      const updateData = await parseJsonSafely(updateRes)

      if (!updateRes.ok) {
        throw new Error(updateData.error || 'Error al actualizar lección')
      }

      const newAssets: any[] = []

      const uploadedPdfs = await uploadFiles(pdfFiles, 'pdf', lesson.id)
      uploadedPdfs.forEach((file, index) => {
        newAssets.push({
          assetType: 'pdf',
          title: file.originalName,
          fileUrl: file.publicUrl,
          storageBucket: file.storageBucket,
          storagePath: file.storagePath,
          position: existingAssets.length + index + 1,
        })
      })

      const uploadedVideos = await uploadFiles(videoFiles, 'video', lesson.id)
      uploadedVideos.forEach((file, index) => {
        newAssets.push({
          assetType: 'video',
          title: file.originalName,
          fileUrl: file.publicUrl,
          storageBucket: file.storageBucket,
          storagePath: file.storagePath,
          position: existingAssets.length + uploadedPdfs.length + index + 1,
        })
      })

      const uploadedImages = await uploadFiles(imageFiles, 'image', lesson.id)
      uploadedImages.forEach((file, index) => {
        newAssets.push({
          assetType: 'image',
          title: file.originalName,
          fileUrl: file.publicUrl,
          storageBucket: file.storageBucket,
          storagePath: file.storagePath,
          position:
            existingAssets.length +
            uploadedPdfs.length +
            uploadedVideos.length +
            index +
            1,
        })
      })

      if (newAssets.length > 0) {
        const assetsRes = await fetch('/api/admin/lesson-assets/create-many', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({
            lessonId: lesson.id,
            assets: newAssets,
          }),
        })

        const assetsData = await parseJsonSafely(assetsRes)

        if (!assetsRes.ok) {
          throw new Error(assetsData.error || 'Error al guardar nuevos archivos')
        }
      }

      router.push('/admin/lecciones')
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al actualizar lección')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            <option key={module.id} value={module.id}>
              {course?.title ? `${course.title} / ${module.title}` : module.title}
            </option>
          )
        })}
      </select>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white outline-none"
        required
      />

      <select
        value={lessonType}
        onChange={(e) => setLessonType(e.target.value as 'mixed' | 'text')}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white outline-none"
      >
        <option value="mixed">Lección multimedia</option>
        <option value="text">Solo texto</option>
      </select>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-30 w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white outline-none"
      />

      <div className="space-y-3 rounded-2xl border border-white/20 bg-black p-4">
        <p className="text-sm font-medium text-white">Portada actual / nueva</p>

        {lesson.cover_image_url && (
          <img
            src={lesson.cover_image_url}
            alt={lesson.title}
            className="h-44 w-full rounded-2xl border border-white/10 object-cover"
          />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          className="w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white file:mr-3 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-black"
        />
      </div>

      <div className="rounded-2xl border border-white/20 bg-black p-4">
        <p className="mb-4 text-sm font-medium text-white">Archivos actuales</p>

        {existingAssets.length > 0 ? (
          <div className="space-y-3">
            {existingAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {asset.title || 'Archivo'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Tipo: {asset.asset_type}
                  </p>
                </div>

                <DeleteLessonAssetButton assetId={asset.id} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No hay archivos cargados todavía.</p>
        )}
      </div>

      <div className="space-y-2 rounded-2xl border border-white/20 bg-black p-4">
        <p className="text-sm font-medium text-white">Agregar nuevos PDFs</p>
        <input
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={(e) => setPdfFiles(Array.from(e.target.files || []))}
          className="w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white file:mr-3 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-black"
        />
      </div>

      <div className="space-y-2 rounded-2xl border border-white/20 bg-black p-4">
        <p className="text-sm font-medium text-white">Agregar nuevos videos</p>
        <input
          type="file"
          accept="video/*"
          multiple
          onChange={(e) => setVideoFiles(Array.from(e.target.files || []))}
          className="w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white file:mr-3 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-black"
        />
      </div>

      <div className="space-y-2 rounded-2xl border border-white/20 bg-black p-4">
        <p className="text-sm font-medium text-white">Agregar nuevas imágenes</p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
          className="w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white file:mr-3 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-black"
        />
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

