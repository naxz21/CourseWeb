// Agregá o reemplazá el tipo Asset en tu lib/types.ts

export type AssetProvider = 'local' | 'gdrive'

export type Asset = {
  id: string
  lesson_id?: string
  asset_type: 'video' | 'pdf' | 'image'
  title: string | null
  file_url: string | null        // null cuando provider = 'gdrive'
  storage_bucket?: string | null
  storage_path?: string | null
  provider: AssetProvider        // 'local' | 'gdrive'
  provider_file_id?: string | null
  position: number
}