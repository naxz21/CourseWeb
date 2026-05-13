'use client'

import MuxPlayer from '@mux/mux-player-react'

interface MuxPlayerWrapperProps {
  playbackId: string
  title?: string
}

export default function MuxPlayerWrapper({ playbackId, title }: MuxPlayerWrapperProps) {
  return (
    <div style={{ borderRadius: '0.75rem', overflow: 'hidden', lineHeight: 0 }}>
      <MuxPlayer
        playbackId={playbackId}
        streamType="on-demand"
        accentColor="#4A7C3F"
        metadata={{ video_title: title }}
        style={{ width: '100%', display: 'block' }}
      />
    </div>
  )
}
