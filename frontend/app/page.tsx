'use client'

import { useState, useEffect } from 'react'
import { clientLogger } from '@/lib/client-logger'
import { StreamerList } from '@/components/streamer-list'
import { StreamView } from '@/components/stream-view'
import { StreamerDashboard } from '@/components/streamer-dashboard'
import { Streamer } from '@/app/types'
import { getAllStreams, Stream as ApiStream } from '@/lib/api-stream'

const mockStreamers: Streamer[] = [
  {
    id: '1',
    name: 'GamerGirl123',
    avatar:
      'https://ui-avatars.com/api/?name=GG&background=e74c3c&color=fff&size=40',
    title: 'Epic Valorant Ranked Climb! Road to Radiant 🔥',
    category: 'Valorant',
    viewers: 2847,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '2',
    name: 'ProPlayer_Mike',
    avatar:
      'https://ui-avatars.com/api/?name=PM&background=3498db&color=fff&size=40',
    title: 'League of Legends Solo Queue - Challenger Gameplay',
    category: 'League of Legends',
    viewers: 1523,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '3',
    name: 'ArtisticAnna',
    avatar:
      'https://ui-avatars.com/api/?name=AA&background=9b59b6&color=fff&size=40',
    title: 'Digital Art Stream - Drawing Fantasy Characters',
    category: 'Art',
    viewers: 892,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '4',
    name: 'MusicMaster_DJ',
    avatar:
      'https://ui-avatars.com/api/?name=MM&background=e67e22&color=fff&size=40',
    title: 'Chill Beats & Good Vibes - Late Night Mix',
    category: 'Music',
    viewers: 1247,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '5',
    name: 'CookingChef_Sam',
    avatar:
      'https://ui-avatars.com/api/?name=CS&background=27ae60&color=fff&size=40',
    title: 'Making Homemade Pasta from Scratch!',
    category: 'Cooking',
    viewers: 634,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '6',
    name: 'TechTalker',
    avatar:
      'https://ui-avatars.com/api/?name=TT&background=2c3e50&color=fff&size=40',
    title: 'Building a Full-Stack App with Next.js and Firebase',
    category: 'Programming',
    viewers: 1876,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '7',
    name: 'FitnessFanatic',
    avatar:
      'https://ui-avatars.com/api/?name=FF&background=f39c12&color=fff&size=40',
    title: '30-Minute HIIT Workout - No Equipment Needed!',
    category: 'Fitness',
    viewers: 2134,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '8',
    name: 'TravelBug',
    avatar:
      'https://ui-avatars.com/api/?name=TB&background=16a085&color=fff&size=40',
    title: 'Exploring Tokyo Streets - Live Walking Tour',
    category: 'Travel',
    viewers: 3567,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '9',
    name: 'BookWorm',
    avatar:
      'https://ui-avatars.com/api/?name=BW&background=8e44ad&color=fff&size=40',
    title: "Book Club Discussion - 'The Midnight Library'",
    category: 'Books',
    viewers: 743,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '10',
    name: 'ComedyKing',
    avatar:
      'https://ui-avatars.com/api/?name=CK&background=d35400&color=fff&size=40',
    title: 'Stand-up Comedy Night - Live from My Basement',
    category: 'Comedy',
    viewers: 4231,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '11',
    name: 'MovieCritic',
    avatar:
      'https://ui-avatars.com/api/?name=MC&background=c0392b&color=fff&size=40',
    title: 'Reviewing the Latest Marvel Movie - Spoilers!',
    category: 'Movies',
    viewers: 1892,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1489599904847-62b4c666e70a?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '12',
    name: 'ScienceGeek',
    avatar:
      'https://ui-avatars.com/api/?name=SG&background=2980b9&color=fff&size=40',
    title: 'Explaining Quantum Physics in Simple Terms',
    category: 'Science',
    viewers: 2156,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '13',
    name: 'CryptoExpert',
    avatar:
      'https://ui-avatars.com/api/?name=CE&background=f1c40f&color=000&size=40',
    title: 'Bitcoin Analysis - Where is the Market Heading?',
    category: 'Cryptocurrency',
    viewers: 3245,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '14',
    name: 'PetLover',
    avatar:
      'https://ui-avatars.com/api/?name=PL&background=e91e63&color=fff&size=40',
    title: 'Puppy Training 101 - Basic Commands',
    category: 'Pets',
    viewers: 1432,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '15',
    name: 'FashionIcon',
    avatar:
      'https://ui-avatars.com/api/?name=FI&background=9c27b0&color=fff&size=40',
    title: "Summer Fashion Trends 2025 - What's Hot",
    category: 'Fashion',
    viewers: 2765,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '16',
    name: 'DIY_Master',
    avatar:
      'https://ui-avatars.com/api/?name=DM&background=795548&color=fff&size=40',
    title: 'Building a Bookshelf from Reclaimed Wood',
    category: 'DIY',
    viewers: 1123,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '17',
    name: 'MindfulnessCoach',
    avatar:
      'https://ui-avatars.com/api/?name=MC&background=4caf50&color=fff&size=40',
    title: 'Guided Meditation for Stress Relief',
    category: 'Wellness',
    viewers: 1876,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '18',
    name: 'HistoryBuff',
    avatar:
      'https://ui-avatars.com/api/?name=HB&background=607d8b&color=fff&size=40',
    title: 'Ancient Rome: The Rise and Fall of the Empire',
    category: 'History',
    viewers: 987,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73d12?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '19',
    name: 'SpaceEnthusiast',
    avatar:
      'https://ui-avatars.com/api/?name=SE&background=673ab7&color=fff&size=40',
    title: 'Live Coverage of SpaceX Rocket Launch',
    category: 'Space',
    viewers: 5432,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=200&fit=crop&crop=center'
  },
  {
    id: '20',
    name: 'LanguageTutor',
    avatar:
      'https://ui-avatars.com/api/?name=LT&background=ff5722&color=fff&size=40',
    title: 'Learn Spanish in 30 Days - Day 15',
    category: 'Education',
    viewers: 1543,
    isLive: true,
    thumbnail:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop&crop=center'
  }
]

// Function to generate random stream ID
const generateRandomStreamId = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

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
      clientLogger.info('No live streams fetched from API or API error', {}, 'fetchStreams')
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchStreams()
    } catch (error) {
      console.error('Failed to refresh streams:', error)
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
          clientLogger.debug('Auto-refreshed stream list', {}, 'App')
        } catch (error) {
          console.error('Auto-refresh failed:', error)
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
