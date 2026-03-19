import { NextRequest, NextResponse } from 'next/server'
import { requireAdminFromRequest } from '@/lib/auth/is-admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BUCKET = 'lesson-assets'

function normalizeFileName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9.\-_]/g, '-')
    .toLowerCase()
}

function getFolderByType(type: string) {
  if (type === 'video') return 'videos'
  if (type === 'pdf') return 'pdfs'
  if (type === 'image') return 'images'
  if (type === 'cover') return 'covers'
  return 'others'
}

export async function POST(req: NextRequest) {
  try {
    const { user, isAdmin } = await requireAdminFromRequest(req)

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const assetType = String(formData.get('assetType') || '')
    const lessonId = String(formData.get('lessonId') || '')

    if (!lessonId) {
      return NextResponse.json({ error: 'Falta lessonId' }, { status: 400 })
    }

    if (!files.length) {
      return NextResponse.json({ error: 'No files' }, { status: 400 })
    }

    if (!['video', 'pdf', 'image', 'cover'].includes(assetType)) {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    const uploaded: Array<{
      publicUrl: string
      storageBucket: string
      storagePath: string
      originalName: string
    }> = []

    for (const file of files) {
      const maxSizeMb =
        assetType === 'video' ? 200 : assetType === 'pdf' ? 30 : 15

      if (file.size > maxSizeMb * 1024 * 1024) {
        return NextResponse.json(
          { error: `Uno de los archivos supera el máximo permitido (${maxSizeMb} MB)` },
          { status: 400 }
        )
      }

      const safeName = normalizeFileName(file.name)
      const uniquePart = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const path = `${getFolderByType(assetType)}/${lessonId}/${uniquePart}-${safeName}`

      const arrayBuffer = await file.arrayBuffer()
      const uint8 = new Uint8Array(arrayBuffer)

      let contentType = file.type || 'application/octet-stream'
      if (assetType === 'pdf') contentType = 'application/pdf'
      if (assetType === 'image' && !contentType.startsWith('image/')) contentType = 'image/jpeg'
      if (assetType === 'video' && !contentType.startsWith('video/')) contentType = 'video/mp4'

      const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, uint8, { contentType, upsert: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)

      uploaded.push({
        publicUrl: data.publicUrl,
        storageBucket: BUCKET,
        storagePath: path,
        originalName: file.name,
      })
    }

    return NextResponse.json({ ok: true, files: uploaded })
  } catch (err: any) {
    console.error('UPLOAD ASSET ERROR:', err)
    return NextResponse.json(
      { error: err?.message || 'Error al subir archivos' },
      { status: 500 }
    )
  }
}