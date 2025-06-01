'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StreamView } from '@/components/stream-view'
import { Streamer } from '@/app/types'
import { getStreamByTextId } from '@/lib/api-stream'
import { clientLogger } from '@/lib/client-logger'

// Function to generate display name for a single streamer
const generateDisplayNameForStream = (streamId: string) => {
  // This is a simplified version. You might want a more robust way to get display names
  // or ensure consistency if the stream was in the original list.
  // For now, we'll use a generic approach or a hash for some variety.
  const parts = streamId.split('-')
  const lastPart = parts[parts.length - 1] || streamId
  const nameIndex = parseInt(lastPart, 16) % 20 // Use a fixed list size

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
  return streamNames[nameIndex] || `Streamer-${streamId.substring(0, 4)}`
}

export default function StreamPage () {
  const router = useRouter()
  const params = useParams()
  const streamId = params.id as string
  const [streamer, setStreamer] = useState<Streamer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (streamId) {
      const fetchStreamData = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const apiStream = await getStreamByTextId(streamId)
          if (apiStream) {
            const displayName = generateDisplayNameForStream(apiStream.streamId)
            setStreamer({
              id: apiStream.streamId,
              name: displayName,
              avatar: `https://ui-avatars.com/api/?name=${displayName.charAt(
                0
              )}&background=random&color=fff&size=40`,
              title: `Stream - ${displayName}`,
              category: 'Live Stream',
              viewers: Math.floor(Math.random() * 5000) + 100, // Placeholder, ideally from API
              isLive: true, // Placeholder, ideally from API
              thumbnail: `https://ams-30774.antmedia.cloud:5443/LiveApp/previews/${
                apiStream.streamId
              }.png?t=${Date.now()}`
            })
          } else {
            setError('Stream not found.')
            clientLogger.warn(
              'Stream not found by ID',
              { streamId },
              'StreamPage'
            )
          }
        } catch (err) {
          clientLogger.error(
            'Failed to fetch stream data',
            { streamId, error: err },
            'StreamPage'
          )
          setError('Failed to load stream. Please try again later.')
        }
        setIsLoading(false)
      }
      fetchStreamData()
    }
  }, [streamId])

  const handleBack = () => {
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex justify-center items-center'>
        <p className='text-lg text-gray-600'>Loading stream...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex flex-col justify-center items-center'>
        <p className='text-lg text-red-600'>{error}</p>
        <button
          onClick={handleBack}
          className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          Back to list
        </button>
      </div>
    )
  }

  if (!streamer) {
    // This case should ideally be handled by the error state if stream not found
    return (
      <div className='min-h-screen bg-gray-50 flex justify-center items-center'>
        <p className='text-lg text-gray-600'>Stream data not available.</p>
      </div>
    )
  }

  return <StreamView streamer={streamer} onBack={handleBack} />
}
