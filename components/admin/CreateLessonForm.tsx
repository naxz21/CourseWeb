'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Module = {
  id: string
  title: string
  courses?: { title: string } | { title: string }[]
}

type Lesson = {
  id: string
  module_id: string
  position: number
}

type UploadedAsset = {
  assetType: 'video' | 'pdf' | 'image'
  title: string
  fileUrl: string
  storageBucket: string
  storagePath: string
  position: number
  originalName: string
}

async function parseJsonSafely(res: Response) {
  const text = await res.text()

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(text || 'El servidor devolvió una respuesta inválida')
  }
}

export default function CreateLessonForm({
  modules,
  existingLessons = [],
}: {
  modules: Module[]
  existingLessons?: Lesson[]
}) {
  const router = useRouter()

  const [moduleId, setModuleId] = useState(modules[0]?.id || '')
  const [title, setTitle] = useState('')
  const [lessonType, setLessonType] = useState<'mixed' | 'text'>('mixed')
  const [content, setContent] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  const [videoFiles, setVideoFiles] = useState<File[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  const nextPosition = useMemo(() => {
    const lessonsOfModule = existingLessons.filter(
      (lesson) => lesson.module_id === moduleId
    )
    if (lessonsOfModule.length === 0) return 1
    return (
      Math.max(...lessonsOfModule.map((lesson) => Number(lesson.position) || 0)) + 1
    )
  }, [existingLessons, moduleId])

  async function uploadFiles(
    files: File[],
    assetType: 'video' | 'pdf' | 'image' | 'cover',
    lessonId: string
  ) {
    if (!files.length) return []

    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    formData.append('assetType', assetType)
    formData.append('lessonId', lessonId)

    const res = await fetch('/api/admin/lesson-assets/upload', {
      method: 'POST',
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    let createdLessonId: string | null = null

    try {
      const createRes = await fetch('/api/admin/lessons/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId,
          title,
          lessonType,
          content,
        }),
      })

      const createData = await parseJsonSafely(createRes)

      if (!createRes.ok) {
        throw new Error(createData.error || 'Error al crear lección')
      }

      createdLessonId = createData.lessonId as string
      const lessonId = createdLessonId

      let coverImageUrl: string | null = null
      let coverStorageBucket: string | null = null
      let coverStoragePath: string | null = null

      if (coverFile) {
        const uploadedCover = await uploadFiles([coverFile], 'cover', lessonId)
        if (uploadedCover[0]) {
          coverImageUrl = uploadedCover[0].publicUrl
          coverStorageBucket = uploadedCover[0].storageBucket
          coverStoragePath = uploadedCover[0].storagePath
        }
      }

      const allAssets: UploadedAsset[] = []

      const uploadedPdfs = await uploadFiles(pdfFiles, 'pdf', lessonId)
      uploadedPdfs.forEach((file, index) => {
        allAssets.push({
          assetType: 'pdf',
          title: file.originalName,
          fileUrl: file.publicUrl,
          storageBucket: file.storageBucket,
          storagePath: file.storagePath,
          position: index + 1,
          originalName: file.originalName,
        })
      })

      const uploadedVideos = await uploadFiles(videoFiles, 'video', lessonId)
      uploadedVideos.forEach((file, index) => {
        allAssets.push({
          assetType: 'video',
          title: file.originalName,
          fileUrl: file.publicUrl,
          storageBucket: file.storageBucket,
          storagePath: file.storagePath,
          position: uploadedPdfs.length + index + 1,
          originalName: file.originalName,
        })
      })

      const uploadedImages = await uploadFiles(imageFiles, 'image', lessonId)
      uploadedImages.forEach((file, index) => {
        allAssets.push({
          assetType: 'image',
          title: file.originalName,
          fileUrl: file.publicUrl,
          storageBucket: file.storageBucket,
          storagePath: file.storagePath,
          position: uploadedPdfs.length + uploadedVideos.length + index + 1,
          originalName: file.originalName,
        })
      })

      const updateRes = await fetch('/api/admin/lessons/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          moduleId,
          title,
          lessonType,
          content,
          coverImageUrl,
          coverStorageBucket,
          coverStoragePath,
        }),
      })

      const updateData = await parseJsonSafely(updateRes)

      if (!updateRes.ok) {
        throw new Error(updateData.error || 'Error al actualizar portada')
      }

      if (allAssets.length > 0) {
        const assetsRes = await fetch('/api/admin/lesson-assets/create-many', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId,
            assets: allAssets,
          }),
        })

        const assetsData = await parseJsonSafely(assetsRes)

        if (!assetsRes.ok) {
          throw new Error(assetsData.error || 'Error al guardar archivos')
        }
      }

      setTitle('')
      setContent('')
      setLessonType('mixed')
      setCoverFile(null)
      setPdfFiles([])
      setVideoFiles([])
      setImageFiles([])

      router.refresh()
      alert('Lección creada correctamente')
    } catch (error) {
      if (createdLessonId) {
        try {
          await fetch('/api/admin/lessons/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lessonId: createdLessonId }),
          })
        } catch {}
      }

      alert(error instanceof Error ? error.message : 'Error al crear lección')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        placeholder="Título de la lección"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
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
        placeholder="Contenido / descripción de la lección"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-30 w-full rounded-2xl border border-white/40 bg-black px-4 py-3 text-white placeholder:text-gray-500 outline-none"
      />

      <div className="space-y-2 rounded-2xl border border-white/20 bg-black p-4">
        <p className="text-sm font-medium text-white">Imagen principal de la lección</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
          className="w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white file:mr-3 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-black"
        />
      </div>

      <div className="space-y-2 rounded-2xl border border-white/20 bg-black p-4">
        <p className="text-sm font-medium text-white">PDFs de la lección</p>
        <input
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={(e) => setPdfFiles(Array.from(e.target.files || []))}
          className="w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white file:mr-3 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-black"
        />
        <p className="text-xs text-gray-400">{pdfFiles.length} archivo(s) seleccionado(s)</p>
      </div>

      <div className="space-y-2 rounded-2xl border border-white/20 bg-black p-4">
        <p className="text-sm font-medium text-white">Videos de la lección</p>
        <input
          type="file"
          accept="video/*"
          multiple
          onChange={(e) => setVideoFiles(Array.from(e.target.files || []))}
          className="w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white file:mr-3 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-black"
        />
        <p className="text-xs text-gray-400">{videoFiles.length} archivo(s) seleccionado(s)</p>
      </div>

      <div className="space-y-2 rounded-2xl border border-white/20 bg-black p-4">
        <p className="text-sm font-medium text-white">Imágenes internas de la lección</p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
          className="w-full rounded-xl border border-white/20 bg-black px-4 py-3 text-white file:mr-3 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-black"
        />
        <p className="text-xs text-gray-400">{imageFiles.length} archivo(s) seleccionado(s)</p>
      </div>

      <div className="rounded-2xl border border-white/20 bg-black px-4 py-3 text-sm text-gray-300">
        Posición asignada automáticamente: <strong className="text-white">{nextPosition}</strong>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? 'Creando lección...' : 'Crear lección'}
      </button>
    </form>
  )
}
