'use client'

import { useState, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js';
import { StreamerList } from '@/components/streamer-list'
import { StreamView } from '@/components/stream-view'
import { StreamerDashboard } from '@/components/streamer-dashboard'
import { Streamer } from '@/app/types'
import { getAllStreams, Stream as ApiStream } from '@/lib/api-stream'

const mockStreamers: Streamer[] = [
  {
    id: '1',
    name: 'GamerGirl123',
    avatar: '/placeholder.svg?height=40&width=40',
    title: 'Epic Valorant Ranked Climb! Road to Radiant 🔥',
    category: 'Valorant',
    viewers: 2847,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '2',
    name: 'ProPlayer_Mike',
    avatar: '/placeholder.svg?height=40&width=40',
    title: 'League of Legends Solo Queue - Challenger Gameplay',
    category: 'League of Legends',
    viewers: 1523,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '3',
    name: 'ArtisticAnna',
    avatar: '/placeholder.svg?height=40&width=40',
    title: 'Digital Art Stream - Drawing Fantasy Characters',
    category: 'Art',
    viewers: 892,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '4',
    name: 'MusicMaster_DJ',
    avatar: '/placeholder.svg?height=40&width=40',
    title: 'Chill Beats & Good Vibes - Late Night Mix',
    category: 'Music',
    viewers: 1247,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '5',
    name: 'CookingChef_Sam',
    avatar: '/placeholder.svg?height=40&width=40',
    title: 'Making Homemade Pasta from Scratch!',
    category: 'Cooking',
    viewers: 634,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '6',
    name: 'TechTalker',
    avatar: '/placeholder.svg?height=40&width=40',
    title: 'Building a Full-Stack App with Next.js and Firebase',
    category: 'Programming',
    viewers: 1876,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '7',
    name: 'FitnessFanatic',
    avatar: '/placeholder.svg?height=40&width=40',
    title: '30-Minute HIIT Workout - No Equipment Needed!',
    category: 'Fitness',
    viewers: 2134,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '8',
    name: 'TravelBug',
    avatar: '/placeholder.svg?height=40&width=40',
    title: 'Exploring Tokyo Streets - Live Walking Tour',
    category: 'Travel',
    viewers: 3567,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '9',
    name: 'BookWorm',
    avatar: '/placeholder.svg?height=40&width=40',
    title: "Book Club Discussion - 'The Midnight Library'",
    category: 'Books',
    viewers: 743,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '10',
    name: 'ComedyKing',
    avatar: '/placeholder.svg?height=40&width=40',
    title: 'Stand-up Comedy Night - Live from My Basement',
    category: 'Comedy',
    viewers: 4231,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '11',
    name: 'MovieCritic',
    avatar: '/placeholder.svg?height=40&width=40',
    title: 'Reviewing the Latest Marvel Movie - Spoilers!',
    category: 'Movies',
    viewers: 1892,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '12',
    name: 'ScienceGeek',
    avatar: '/placeholder.svg?height=40&width=40',
    title: 'Explaining Quantum Physics in Simple Terms',
    category: 'Science',
    viewers: 2156,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '13',
    name: 'CryptoExpert',
    avatar: '/placeholder.svg?height=40&width=40',
    title: 'Bitcoin Analysis - Where is the Market Heading?',
    category: 'Cryptocurrency',
    viewers: 3245,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '14',
    name: 'PetLover',
    avatar: '/placeholder.svg?height=40&width=40',
    title: 'Puppy Training 101 - Basic Commands',
    category: 'Pets',
    viewers: 1432,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '15',
    name: 'FashionIcon',
    avatar: '/placeholder.svg?height=40&width=40',
    title: "Summer Fashion Trends 2025 - What's Hot",
    category: 'Fashion',
    viewers: 2765,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '16',
    name: 'DIY_Master',
    avatar: '/placeholder.svg?height=40&width=40',
    title: 'Building a Bookshelf from Reclaimed Wood',
    category: 'DIY',
    viewers: 1123,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '17',
    name: 'MindfulnessCoach',
    avatar: '/placeholder.svg?height=40&width=40',
    title: 'Guided Meditation for Stress Relief',
    category: 'Wellness',
    viewers: 1876,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '18',
    name: 'HistoryBuff',
    avatar: '/placeholder.svg?height=40&width=40',
    title: 'Ancient Rome: The Rise and Fall of the Empire',
    category: 'History',
    viewers: 987,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '19',
    name: 'SpaceEnthusiast',
    avatar: '/placeholder.svg?height=40&width=40',
    title: 'Live Coverage of SpaceX Rocket Launch',
    category: 'Space',
    viewers: 5432,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  },
  {
    id: '20',
    name: 'LanguageTutor',
    avatar: '/placeholder.svg?height=40&width=40',
    title: 'Learn Spanish in 30 Days - Day 15',
    category: 'Education',
    viewers: 1543,
    isLive: true,
    thumbnail: '/placeholder.svg?height=200&width=300'
  }
]

export default function App () {
  const [selectedStreamer, setSelectedStreamer] = useState<Streamer | null>(
    null
  )
  const [appMode, setAppMode] = useState<'viewer' | 'streamer'>('viewer')
  const [liveStreams, setLiveStreams] = useState<Streamer[]>([])
  const [isLoadingStreams, setIsLoadingStreams] = useState(true)

  useEffect(() => {
    console.log('Opened in World App?', MiniKit.isInstalled());
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
            title: `Stream ${index + 1}`,
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
