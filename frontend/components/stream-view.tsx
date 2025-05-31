'use client'

import { useState, useEffect, useRef } from 'react'
import { clientLogger } from '@/lib/client-logger'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ArrowLeft,
  Heart,
  Send,
  DollarSign,
  Users,
  MessageCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react'
import { Streamer, ChatMessage } from '@/app/types'
import { StreamViewHeader } from './stream-view-header'
import { ChatMessageList } from './chat-message-list'
import { ChatInputArea } from './chat-input-area'
import { TipCommentModal } from './tip-comment-modal'
import { getStreamByTextId, Stream as ApiStream } from '@/lib/api-stream'

const PlayingComponent = dynamic(() => import('./playingComponent'), {
  ssr: false,
  loading: () => (
    <div className='w-full h-48 flex justify-center items-center bg-gray-800 text-white'>
      <p>Loading player...</p>
    </div>
  )
})

interface StreamViewProps {
  streamer: Streamer
  onBack: () => void
}

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    username: 'viewer123',
    message: 'Great stream! Keep it up!',
    timestamp: '2:30 PM'
  },
  {
    id: '2',
    username: 'fan_girl',
    message: 'Love your content ❤️',
    timestamp: '2:31 PM'
  },
  {
    id: '3',
    username: 'pro_gamer_99',
    message: 'That was an insane play! How did you do that?',
    timestamp: '2:32 PM'
  },
  {
    id: '4',
    username: 'music_lover',
    message: "What's the name of this song? It's fire 🔥",
    timestamp: '2:33 PM'
  },
  {
    id: '5',
    username: 'generous_user',
    message: 'Thanks for the amazing stream!',
    timestamp: '2:34 PM',
    isTip: true,
    tipAmount: 5
  },
  {
    id: '6',
    username: 'regular_viewer',
    message: 'Can you play my favorite song next?',
    timestamp: '2:35 PM'
  },
  {
    id: '7',
    username: 'chat_moderator',
    message: 'Welcome everyone! Remember to be respectful 😊',
    timestamp: '2:36 PM'
  },
  {
    id: '8',
    username: 'new_follower',
    message: 'Just followed! This content is amazing',
    timestamp: '2:37 PM'
  },
  {
    id: '9',
    username: 'longtime_fan',
    message: 'Been watching for 2 years, still the best streamer!',
    timestamp: '2:38 PM',
    tipsReceived: [{ username: 'grateful_viewer', amount: 3 }]
  },
  {
    id: '10',
    username: 'question_asker',
    message: "What's your setup? Your audio quality is perfect",
    timestamp: '2:39 PM'
  },
  {
    id: '11',
    username: 'emoji_user',
    message: 'POGGERS! 🎮✨💯',
    timestamp: '2:40 PM'
  },
  {
    id: '12',
    username: 'helpful_viewer',
    message: 'For anyone asking, the game is available on Steam',
    timestamp: '2:41 PM'
  },
  {
    id: '13',
    username: 'big_tipper',
    message: 'Keep up the great work!',
    timestamp: '2:42 PM',
    isTip: true,
    tipAmount: 10
  },
  {
    id: '14',
    username: 'casual_chatter',
    message: 'Anyone else here from the YouTube video?',
    timestamp: '2:43 PM'
  },
  {
    id: '15',
    username: 'game_expert',
    message: 'Try using the special ability combo for more damage',
    timestamp: '2:44 PM'
  },
  {
    id: '16',
    username: 'supportive_fan',
    message: "You're doing great! Don't listen to the haters",
    timestamp: '2:45 PM',
    tipsReceived: [
      { username: 'kind_soul', amount: 2 },
      { username: 'positive_vibes', amount: 1 }
    ]
  },
  {
    id: '17',
    username: 'stream_regular',
    message: 'What time do you usually stream? Want to catch more',
    timestamp: '2:46 PM'
  },
  {
    id: '18',
    username: 'excited_viewer',
    message: 'OMG that was so close! My heart is racing ��',
    timestamp: '2:47 PM'
  },
  {
    id: '19',
    username: 'tech_curious',
    message: 'What graphics card are you using? Everything looks so smooth',
    timestamp: '2:48 PM'
  },
  {
    id: '20',
    username: 'community_builder',
    message: 'Love this community! Everyone is so friendly here 🤗',
    timestamp: '2:49 PM'
  },
  {
    id: '21',
    username: 'amazing_viewer',
    message: 'This stream is absolutely incredible! Best content ever!',
    timestamp: '2:50 PM',
    streamerTip: 5
  },
  {
    id: '22',
    username: 'helpful_commenter',
    message: 'For new players: always check your corners and use sound cues',
    timestamp: '2:51 PM',
    streamerTip: 3
  }
]

const REMOTE_VIDEO_ELEMENT_ID_PREFIX = 'remoteVideo-'

export function StreamView ({ streamer, onBack }: StreamViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
  const [tipModalOpen, setTipModalOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(
    null
  )
  const [userMessageIds, setUserMessageIds] = useState<string[]>([])
  const [inputAreaHeight, setInputAreaHeight] = useState(64)
  const inputAreaRef = useRef<HTMLDivElement>(null)

  const [shouldPlayStream, setShouldPlayStream] = useState(false)
  const [isActuallyPlaying, setIsActuallyPlaying] = useState(false)
  const [playbackError, setPlaybackError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  const [currentApiStream, setCurrentApiStream] = useState<ApiStream | null>(
    null
  )

  useEffect(() => {
    setIsClient(true)
  }, [])

  const videoElementId = REMOTE_VIDEO_ELEMENT_ID_PREFIX + streamer.id

  useEffect(() => {
    if (streamer && streamer.id && isClient) {
      const fetchStreamData = async () => {
        const apiStream = await getStreamByTextId(streamer.id)
        setCurrentApiStream(apiStream)
        if (!apiStream) {
          console.error(
            `Stream with textual ID ${streamer.id} not found in DB.`
          )
        }
      }
      fetchStreamData()
    }
  }, [streamer, isClient])

  useEffect(() => {
    if (inputAreaRef.current) {
      const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
          setInputAreaHeight(entry.contentRect.height)
        }
      })

      observer.observe(inputAreaRef.current)

      return () => {
        observer.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    if (streamer && streamer.id) {
      setShouldPlayStream(true)
    }
    return () => {
      setShouldPlayStream(false)
    }
  }, [streamer])

  const handleSendMessage = (messageContent: string) => {
    if (!messageContent.trim()) return

    const messageId = Date.now().toString()
    const newMessage: ChatMessage = {
      id: messageId,
      username: 'You',
      message: messageContent.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    setMessages(prev => [...prev, newMessage])
    setUserMessageIds(prev => [...prev, messageId])

    simulateCommunityTips(messageId)
  }

  const handleSendTip = (messageContent: string, tipAmountValue: string) => {
    if (!tipAmountValue || !messageContent.trim()) return

    const newTip: ChatMessage = {
      id: Date.now().toString(),
      username: 'You',
      message: messageContent.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      isTip: true,
      tipAmount: Number.parseFloat(tipAmountValue)
    }

    setMessages(prev => [...prev, newTip])
  }

  const handleTipComment = (message: ChatMessage) => {
    setSelectedMessage(message)
    setTipModalOpen(true)
  }

  const submitCommentTip = (messageId: string, amountValue: string) => {
    if (!selectedMessage || !amountValue) return

    const amount = Number.parseFloat(amountValue)
    if (isNaN(amount) || amount <= 0) return

    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            tipsReceived: [
              ...(msg.tipsReceived || []),
              { username: 'You', amount }
            ]
          }
        }
        return msg
      })
    )

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username: 'System',
      message: `You tipped ${selectedMessage.username} $${amount}!`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    setMessages(prev => [...prev, newMessage])
    setTipModalOpen(false)
    setSelectedMessage(null)
  }

  const simulateCommunityTips = (messageId: string) => {
    const communityUsers = [
      'StreamFan92',
      'TipMaster',
      'GenerousViewer',
      'CommunityLover',
      'SupportSquad',
      'ChatChamp',
      'KindViewer',
      'StreamSupporter'
    ]

    const tipAmounts = [1, 2, 3, 5]

    if (Math.random() > 0.3) {
      const delay = Math.random() * 6000 + 2000

      setTimeout(() => {
        const randomUser =
          communityUsers[Math.floor(Math.random() * communityUsers.length)]
        const randomAmount =
          tipAmounts[Math.floor(Math.random() * tipAmounts.length)]

        setMessages(prev =>
          prev.map(msg => {
            if (msg.id === messageId) {
              return {
                ...msg,
                tipsReceived: [
                  ...(msg.tipsReceived || []),
                  { username: randomUser, amount: randomAmount }
                ]
              }
            }
            return msg
          })
        )

        const notificationMessage: ChatMessage = {
          id: Date.now().toString(),
          username: 'System',
          message: `${randomUser} tipped you $${randomAmount}! 🎉`,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        }

        setMessages(prev => [...prev, notificationMessage])
      }, delay)

      if (Math.random() > 0.7) {
        const secondDelay = delay + Math.random() * 5000 + 3000

        setTimeout(() => {
          const randomUser2 =
            communityUsers[Math.floor(Math.random() * communityUsers.length)]
          const randomAmount2 =
            tipAmounts[Math.floor(Math.random() * tipAmounts.length)]

          setMessages(prev =>
            prev.map(msg => {
              if (msg.id === messageId) {
                return {
                  ...msg,
                  tipsReceived: [
                    ...(msg.tipsReceived || []),
                    { username: randomUser2, amount: randomAmount2 }
                  ]
                }
              }
              return msg
            })
          )

          const notificationMessage2: ChatMessage = {
            id: Date.now().toString(),
            username: 'System',
            message: `${randomUser2} also tipped you $${randomAmount2}! 💰`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })
          }

          setMessages(prev => [...prev, notificationMessage2])
        }, secondDelay)
      }
    }
  }

  const handlePlaybackStatusUpdate = (
    isActuallyPlayingUpdate: boolean,
    activeStreamId: string | null
  ) => {
    setIsActuallyPlaying(isActuallyPlayingUpdate)
    
    clientLogger.debug('Playback status updated', {
      isActuallyPlaying: isActuallyPlayingUpdate,
      activeStreamId,
      streamerId: streamer.id,
      hasError: !!playbackError
    }, 'StreamView')
    
    if (
      !isActuallyPlayingUpdate &&
      activeStreamId &&
      streamer.id === activeStreamId
    ) {
      if (!playbackError) {
        const errorMessage = 'Stream ended or is unavailable.'
        clientLogger.warn('Playback error', { 
          message: errorMessage,
          streamId: activeStreamId 
        }, 'StreamView')
        setPlaybackError(errorMessage)
      }
    } else if (isActuallyPlayingUpdate) {
      setPlaybackError(null)
    }
  }

  const togglePlayPause = () => {
    if (streamer && streamer.id) {
      setShouldPlayStream(!shouldPlayStream)
      if (playbackError && shouldPlayStream) setPlaybackError(null)
    }
  }

  const CHAT_AREA_TOP_OFFSET = 280

  return (
    <div className='max-w-md mx-auto bg-white min-h-screen relative flex flex-col'>
      <StreamViewHeader streamer={streamer} onBack={onBack} />

      <div className='w-full bg-black relative'>
        {isClient && streamer && streamer.id ? (
          <PlayingComponent
            streamIdToPlay={streamer.id}
            shouldBePlaying={shouldPlayStream}
            videoElementId={videoElementId}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />
        ) : (
          <div className='w-full h-48 flex justify-center items-center bg-gray-800 text-white'>
            <p>
              {!isClient
                ? 'Initializing player...'
                : 'No stream selected or stream ID is missing.'}
            </p>
          </div>
        )}
        {isClient && streamer && streamer.id && (
          <Button
            onClick={togglePlayPause}
            variant='outline'
            size='icon'
            className='absolute bottom-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white z-10'
          >
            {isActuallyPlaying ? (
              <PauseCircle size={24} />
            ) : (
              <PlayCircle size={24} />
            )}
          </Button>
        )}
        {playbackError && (
          <div className='absolute bottom-10 left-1/2 -translate-x-1/2 bg-red-500 text-white p-2 rounded text-xs z-10'>
            {playbackError}
          </div>
        )}
      </div>

      <div className='p-4 border-b border-gray-200'>
        <h2 className='font-medium text-sm mb-1'>{streamer.title}</h2>
        <p className='text-xs text-gray-500 mb-1'>
          Stream Text ID: {streamer.id}
        </p>
        {currentApiStream && currentApiStream.id && (
          <p className='text-xs text-gray-400 mb-2'>
            Stream DB ID: {currentApiStream.id}
          </p>
        )}
        <Badge variant='secondary' className='text-xs rounded-full'>
          {streamer.category}
        </Badge>
      </div>

      <div className='flex flex-col flex-grow overflow-hidden'>
        <div className='flex items-center gap-2 p-3 border-b border-gray-200'>
          <MessageCircle className='w-4 h-4' />
          <span className='text-sm font-medium'>Live Chat</span>
        </div>
        <ChatMessageList
          inputAreaHeight={inputAreaHeight}
          handleTipComment={handleTipComment}
          streamId={currentApiStream?.id}
        />
      </div>

      <ChatInputArea
        onSendMessage={handleSendMessage}
        onSendTip={handleSendTip}
        inputAreaRef={inputAreaRef}
        onHeightChange={setInputAreaHeight}
        stream={currentApiStream}
      />

      <TipCommentModal
        isOpen={tipModalOpen}
        selectedMessage={selectedMessage}
        onClose={() => setTipModalOpen(false)}
        onSubmitTip={submitCommentTip}
      />
    </div>
  )
}
