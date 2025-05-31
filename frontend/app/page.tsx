'use client'

import { useState, useEffect } from 'react'
import { StreamerList } from '@/components/streamer-list'
import { StreamView } from '@/components/stream-view'
import { StreamerDashboard } from '@/components/streamer-dashboard'
import { Streamer } from '@/app/types'
import { getAllStreams, Stream as ApiStream } from '@/lib/api-stream'
import { clientLogger } from '@/lib/client-logger'

// Function to generate display name for streamers
const generateDisplayName = (streamId: string, index: number) => {
  const streamNames = [
    'GamerPro',
    'StreamQueen',
    'PixelMaster',
    'CodeWizard',
    'MusicVibes',
    'ArtisticSoul',
    'TechGuru',
    'FitnessHero',
    'CookingChef',
    'TravelBug',
    'BookWorm',
    'ComedyKing',
    'MovieBuff',
    'ScienceGeek',
    'CryptoExpert',
    'PetLover',
    'FashionIcon',
    'DIYMaster',
    'ZenMaster',
    'HistoryFan'
  ]

  const baseName =
    streamNames[index % streamNames.length] || `Streamer${index + 1}`
  return baseName // Remove the stream ID suffix
}

// Function to safely check MiniKit availability
const checkMiniKitSupport = () => {
  if (typeof window === 'undefined') return false

  try {
    const { MiniKit } = require('@worldcoin/minikit-js')
    return MiniKit && typeof MiniKit.isInstalled === 'function'
      ? MiniKit.isInstalled()
      : false
  } catch (error) {
    console.log('MiniKit not available:', error)
    return false
  }
}

export default function App () {
  const [selectedStreamer, setSelectedStreamer] = useState<Streamer | null>(
    null
  )
  const [appMode, setAppMode] = useState<'viewer' | 'streamer'>('viewer')
  const [liveStreams, setLiveStreams] = useState<Streamer[]>([])
  const [isLoadingStreams, setIsLoadingStreams] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchStreams = async () => {
    const apiStreams: ApiStream[] = await getAllStreams()
    if (apiStreams && apiStreams.length > 0) {
      const transformedStreams: Streamer[] = apiStreams.map(
        (apiStream, index) => ({
          id: apiStream.streamId, // Use actual stream ID from API
          name: generateDisplayName(apiStream.streamId, index),
          avatar: `https://ui-avatars.com/api/?name=S${
            index + 1
          }&background=random&color=fff&size=40`,
          title: `Stream ${index + 1}`,
          category: 'Live Stream',
          viewers: Math.floor(Math.random() * 5000) + 100,
          isLive: true,
          thumbnail: `https://ams-30774.antmedia.cloud:5443/LiveApp/previews/${
            apiStream.streamId
          }.png?t=${Date.now()}`
        })
      )
      setLiveStreams(transformedStreams)
    } else {
      setLiveStreams([])
      clientLogger.info(
        'No live streams fetched from API or API error',
        {},
        'fetchStreams'
      )
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchStreams()
    } catch (error) {
      clientLogger.error('Failed to refresh streams', { error }, 'App')
    } finally {
      setIsRefreshing(false)
    }
  }

  // Initial load effect
  useEffect(() => {
    // Safely check MiniKit support
    const isWorldApp = checkMiniKitSupport()
    console.log('Opened in World App?', isWorldApp)

    const initializeStreams = async () => {
      setIsLoadingStreams(true)
      await fetchStreams()
      setIsLoadingStreams(false)
    }

    if (appMode === 'viewer') {
      initializeStreams()
    }
  }, [appMode])

  // Auto-refresh effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (appMode === 'viewer' && !isLoadingStreams) {
      // Start auto-refresh every second
      intervalId = setInterval(async () => {
        try {
          await fetchStreams()
          console.debug('Auto-refreshed stream list', 'App')
        } catch (error) {
          clientLogger.error('Auto-refresh failed', { error }, 'App')
        }
      }, 1000)
    }

    // Cleanup interval on unmount or mode change
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [appMode, isLoadingStreams])

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
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
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
