'use client'

import { useState, useEffect } from 'react'
import { StreamerList } from '@/components/streamer-list'
import { StreamView } from '@/components/stream-view'
import { StreamerDashboard } from '@/components/streamer-dashboard'
import { Streamer } from '@/app/types'
import { getAllStreams, Stream as ApiStream } from '@/lib/api-stream'

export default function App () {
  const [selectedStreamer, setSelectedStreamer] = useState<Streamer | null>(
    null
  )
  const [appMode, setAppMode] = useState<'viewer' | 'streamer'>('viewer')
  const [liveStreams, setLiveStreams] = useState<Streamer[]>([])
  const [isLoadingStreams, setIsLoadingStreams] = useState(true)

  useEffect(() => {
    const fetchStreams = async () => {
      setIsLoadingStreams(true)
      const apiStreams: ApiStream[] = await getAllStreams()
      if (apiStreams && apiStreams.length > 0) {
        const transformedStreams: Streamer[] = apiStreams.map(
          (apiStream, index) => ({
            id: apiStream.streamId,
            name: `Streamer ${index + 1} (${apiStream.streamId.substring(
              0,
              6
            )})`,
            avatar: `/placeholder.svg?seed=${apiStream.streamId}&height=40&width=40`,
            title: `Live: ${apiStream.streamId}`,
            category: 'Live Stream',
            viewers: Math.floor(Math.random() * 5000) + 100,
            isLive: true,
            thumbnail: `/placeholder.svg?seed=${apiStream.streamId}&height=200&width=300`
          })
        )
        setLiveStreams(transformedStreams)
      } else {
        setLiveStreams([])
        console.log('No live streams fetched from API or API error.')
      }
      setIsLoadingStreams(false)
    }

    if (appMode === 'viewer') {
      fetchStreams()
    }
  }, [appMode])

  const handleSelectStreamer = (streamer: Streamer) => {
    setSelectedStreamer(streamer)
  }

  const handleBackToList = () => {
    setSelectedStreamer(null)
  }

  const toggleAppMode = () => {
    setAppMode(appMode === 'viewer' ? 'streamer' : 'viewer')
    setSelectedStreamer(null)
  }

  if (appMode === 'viewer' && isLoadingStreams) {
    return (
      <div className='min-h-screen bg-gray-50 flex justify-center items-center'>
        <p className='text-lg text-gray-600'>Loading streams...</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 relative'>
      {appMode === 'viewer' ? (
        // Viewer App
        !selectedStreamer ? (
          <StreamerList
            streamers={liveStreams}
            onSelectStreamer={handleSelectStreamer}
            onToggleAppMode={toggleAppMode}
            appMode={appMode}
          />
        ) : (
          <StreamView streamer={selectedStreamer} onBack={handleBackToList} />
        )
      ) : (
        // Streamer Dashboard
        <StreamerDashboard onToggleAppMode={toggleAppMode} appMode={appMode} />
      )}
    </div>
  )
}
