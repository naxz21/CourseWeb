import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/is-admin'
import { supabaseAdmin } from '@/lib/supabase/admin'

const BUCKET = 'lesson-assets'

function getExtension(fileName: string) {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

function getFolderByType(type: string) {
  if (type === 'video') return 'videos'
  if (type === 'pdf') return 'pdfs'
  if (type === 'image') return 'images'
  return 'others'
}

export async function POST(req: Request) {
  const { user, isAdmin } = await requireAdmin()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  if (!isAdmin) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const lessonType = String(formData.get('lessonType') || '')
    const lessonId = String(formData.get('lessonId') || 'new')

    if (!file) {
      return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })
    }

    if (!['video', 'pdf', 'image'].includes(lessonType)) {
      return NextResponse.json({ error: 'Tipo de lección inválido' }, { status: 400 })
    }

    const maxSizeMb =
      lessonType === 'video' ? 200 :
      lessonType === 'pdf' ? 30 :
      15

    if (file.size > maxSizeMb * 1024 * 1024) {
      return NextResponse.json(
        { error: `El archivo supera el máximo permitido (${maxSizeMb} MB)` },
        { status: 400 }
      )
    }

    const ext = getExtension(file.name)
    const safeName = file.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.\-_]/g, '-')
      .toLowerCase()

    const path = `${getFolderByType(lessonType)}/${lessonId}/${Date.now()}-${safeName || `file.${ext || 'bin'}`}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 })
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)

    return NextResponse.json({
      ok: true,
      publicUrl: data.publicUrl,
      storageBucket: BUCKET,
      storagePath: path,
      originalName: file.name,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
  }
}