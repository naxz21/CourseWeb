/**
 * Extrae el fileId de un link de Google Drive.
 * Soporta los formatos más comunes:
 *   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   https://drive.google.com/file/d/FILE_ID/preview
 *   https://drive.google.com/open?id=FILE_ID
 *   https://drive.google.com/uc?id=FILE_ID
 *   https://docs.google.com/document/d/FILE_ID/edit  (y similares)
 */
export function extractGDriveFileId(url: string): string | null {
  if (!url || typeof url !== 'string') return null

  const trimmed = url.trim()

  // Patrón /d/FILE_ID (drive/file, docs, sheets, slides, etc.)
  const slashD = trimmed.match(/\/d\/([a-zA-Z0-9_-]{10,})/)
  if (slashD) return slashD[1]

  // Patrón ?id=FILE_ID o &id=FILE_ID
  const queryId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/)
  if (queryId) return queryId[1]

  return null
}

export function buildGDrivePreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`
} 