'use client'

import { useState, useEffect, useRef } from 'react'
import { clientLogger } from '@/lib/client-logger'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Sparkles, Edit, Save } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'

import { DashboardHeader } from './dashboard-header'
import { DashboardStats } from './dashboard-stats'
import { ChatActivityMonitor } from './chat-activity-monitor'
import { TipCommentModal } from './tip-comment-modal'
import { SprinkleTipsModal } from './sprinkle-tips-modal'
import type { DashboardMessage } from '@/app/types'
import {
  getStreamByTextId,
  Stream as ApiStream,
  createStream,
  deleteStream
} from '@/lib/api-stream'
import { createMessage } from '@/lib/api-message'

const mockMessages: DashboardMessage[] = [
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
    streamerTip: 5
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
    isTip: true,
    streamerTip: 3
  },
  {
    id: '10',
    username: 'question_asker',
    message: "What's your setup? Your audio quality is perfect",
    timestamp: '2:39 PM'
  }
]

const StreamComponent = dynamic(() => import('./streamComponent'), {
  ssr: false,
  loading: () => (
    <div className='w-full h-48 flex justify-center items-center bg-gray-800 text-white'>
      <p>Loading streaming component...</p>
    </div>
  )
})

interface StreamerDashboardProps {
  onToggleAppMode: () => void
  appMode: 'viewer' | 'streamer'
}

export function StreamerDashboard ({ onToggleAppMode }: StreamerDashboardProps) {
  const [isLive, setIsLive] = useState(false)
  const [actuallyStreaming, setActuallyStreaming] = useState(false)
  const [streamIdForComponent, setStreamIdForComponent] = useState(
    'streamerDashboardStream' + Math.random().toString(36).substring(2, 15)
  )
  const [dashboardApiStream, setDashboardApiStream] =
    useState<ApiStream | null>(null)
  const [streamTitle, setStreamTitle] = useState(
    'Epic Valorant Ranked Climb! Road to Radiant 🔥'
  )
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [chatEnabled, setChatEnabled] = useState(true)
  const [viewerCount, setViewerCount] = useState(42) // Mock viewer count
  const [totalTips, setTotalTips] = useState(128) // Mock total tips

  const [streamerTipModalOpen, setStreamerTipModalOpen] = useState(false)
  const [selectedMessageForTip, setSelectedMessageForTip] =
    useState<DashboardMessage | null>(null)

  const [sprinkleModalOpen, setSprinkleModalOpen] = useState(false)
  const [sprinkleInProgress, setSprinkleInProgress] = useState(false)
  const [sprinkleComplete, setSprinkleComplete] = useState(false)

  const [recentMessages, setRecentMessages] = useState<DashboardMessage[]>(mockMessages)

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Simulate viewer count changes
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setViewerCount(prev => {
          const change = Math.floor(Math.random() * 5) - 2 // Random change between -2 and +2
          return Math.max(0, prev + change) // Ensure count doesn't go below 0
        })
      }, 5000) // Update every 5 seconds

      return () => clearInterval(interval)
    }
  }, [isLive])

  const handleToggleLive = async () => {
    try {
      if (!isLive) {
        // Going live - initialize stream
        clientLogger.info(
          `[StreamerDashboard] Initializing stream for going live with ID: ${streamIdForComponent}`,
          'StreamerDashboard'
        )
        const apiStream = await getStreamByTextId(streamIdForComponent)
        if (!apiStream) {
          const newStream = await createStream(streamIdForComponent)
          if (newStream) {
            setDashboardApiStream(newStream)
            clientLogger.info(
              `[StreamerDashboard] Created new stream with ID: ${newStream.streamId}`,
              'StreamerDashboard'
            )
          } else {
            clientLogger.error(
              'Failed to create stream',
              { streamId: streamIdForComponent },
              'StreamerDashboard'
            )
            return
          }
        } else {
          setDashboardApiStream(apiStream)
          clientLogger.info(
            `[StreamerDashboard] Using existing stream with ID: ${apiStream.streamId}`,
            'StreamerDashboard'
          )
        }
        setIsLive(true)
      } else {
        // Going offline - delete stream
        if (dashboardApiStream?.streamId) {
          clientLogger.info(
            `[StreamerDashboard] Deleting stream with ID: ${dashboardApiStream.streamId}`,
            'StreamerDashboard'
          )
          const success = await deleteStream(dashboardApiStream.streamId)
          if (success) {
            setDashboardApiStream(null)
            clientLogger.info(
              `[StreamerDashboard] Successfully deleted stream with ID: ${dashboardApiStream.streamId}`,
              'StreamerDashboard'
            )
          } else {
            clientLogger.error(
              'Failed to delete stream',
              { streamId: dashboardApiStream.streamId },
              'StreamerDashboard'
            )
          }
        }
        setIsLive(false)
      }
    } catch (error) {
      clientLogger.error(
        'Failed to handle stream state change',
        { error, streamId: streamIdForComponent },
        'StreamerDashboard'
      )
    }
  }

  const handleStreamStatusUpdate = (
    isActuallyStreaming: boolean,
    activeStreamId: string | null
  ) => {
    setActuallyStreaming(isActuallyStreaming)
    clientLogger.debug(
      'Stream status update',
      {
        isActuallyStreaming,
        activeStreamId,
        intendedStreamId: streamIdForComponent,
        dashboardStreamId: dashboardApiStream?.streamId
      },
      'StreamerDashboard'
    )

    if (isActuallyStreaming && activeStreamId !== streamIdForComponent) {
      clientLogger.warn(
        'Stream started with different ID than intended',
        {
          actualId: activeStreamId,
          intendedId: streamIdForComponent
        },
        'StreamerDashboard'
      )
    }

    if (!isActuallyStreaming && isLive) {
      setIsLive(false)
      // Clean up stream when actually stopped
      if (dashboardApiStream?.streamId) {
        clientLogger.info(
          `[StreamerDashboard] Cleaning up stream with ID: ${dashboardApiStream.streamId}`,
          'StreamerDashboard'
        )
        deleteStream(dashboardApiStream.streamId)
          .then(success => {
            if (success) {
              setDashboardApiStream(null)
            } else {
              clientLogger.error(
                'Failed to delete stream during cleanup',
                { streamId: dashboardApiStream.streamId },
                'StreamerDashboard'
              )
            }
          })
          .catch(error => {
            clientLogger.error(
              'Error deleting stream during cleanup',
              { error, streamId: dashboardApiStream.streamId },
              'StreamerDashboard'
            )
          })
      }
    }
  }

  const handleSaveTitle = () => setIsEditingTitle(false)
  const handleDeleteMessage = (id: string) => {
    console.log('Dashboard: onDeleteMessage prop called for ID:', id)
  }
  const handleBanUser = (username: string) => {
    console.log('Dashboard: onBanUser prop called for user:', username)
  }

  const handleOpenTipCommentModal = (message: DashboardMessage) => {
    setSelectedMessageForTip(message)
    setStreamerTipModalOpen(true)
  }

  const handleSubmitStreamerTip = (messageId: string, tipAmount: string) => {
    if (!selectedMessageForTip || selectedMessageForTip.id !== messageId) return
    const amount = Number.parseFloat(tipAmount)
    if (isNaN(amount) || amount <= 0) return

    setRecentMessages(prev =>
      prev.map(msg =>
        msg.id === selectedMessageForTip.id
          ? { ...msg, streamerTip: amount, isTip: true, isStreamerTip: true }
          : msg
      )
    )
    const systemMessage: DashboardMessage = {
      id: Date.now().toString(),
      username: 'System',
      message: `Streamer tipped ${
        selectedMessageForTip.username
      } $${amount.toFixed(2)}! 🎉`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      streamerTip: amount,
      isStreamerTip: true,
      isTip: true
    }
    setRecentMessages(prev => [systemMessage, ...prev.slice(0, 19)])
    setTotalTips(prev => prev + amount)
    setStreamerTipModalOpen(false)
    setSelectedMessageForTip(null)
  }

  const handleOpenSprinkleModal = () => {
    setSprinkleModalOpen(true)
    setSprinkleComplete(false)
    setSprinkleInProgress(false)
  }

  const handleSubmitSprinkle = (
    totalAmountStr: string,
    numRecipients: number
  ) => {
    const totalAmountNum = Number.parseFloat(totalAmountStr)
    if (isNaN(totalAmountNum) || totalAmountNum <= 0 || numRecipients <= 0)
      return
    setSprinkleInProgress(true)

    const userPool = [
      'VerifiedFan1',
      'ChattyCathy',
      'SuperUser',
      'CoolDude',
      'StreamChamp',
      'ActiveViewer',
      'ModSquadUser',
      'HappyCamper',
      'LoyalFollower',
      'EngagedUser'
    ]
    const recipients = Array.from(
      { length: numRecipients },
      (_, i) =>
        userPool[i % userPool.length] + (Math.floor(i / userPool.length) || '')
    )
    const individualAmount = Number.parseFloat(
      (totalAmountNum / numRecipients).toFixed(2)
    )
    const actualTotalSprinkled = individualAmount * numRecipients

    setTimeout(() => {
      const systemSprinkleMsg: DashboardMessage = {
        id: Date.now().toString(),
        username: 'System',
        message: `Streamer sprinkled $${actualTotalSprinkled.toFixed(
          2
        )} to ${numRecipients} viewers! Each received $${individualAmount.toFixed(
          2
        )} 🎉✨`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        isStreamerTip: true,
        isTip: true,
        streamerTip: actualTotalSprinkled
      }
      setRecentMessages(prev => [systemSprinkleMsg, ...prev.slice(0, 19)])
      setTotalTips(prev => prev + actualTotalSprinkled)

      recipients.forEach((username, index) => {
        setTimeout(() => {
          const recipientMsg: DashboardMessage = {
            id: Date.now().toString() + index,
            username: 'System',
            message: `${username} received $${individualAmount.toFixed(
              2
            )} from streamer's sprinkle! 💸`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
            isStreamerTip: true,
            isTip: true,
            streamerTip: individualAmount
          }
          setRecentMessages(prev => [recipientMsg, ...prev.slice(0, 19)])
        }, index * 200)
      })
      setSprinkleInProgress(false)
      setSprinkleComplete(true)
      setTimeout(() => {
        setSprinkleModalOpen(false)
        setSprinkleComplete(false)
      }, 2000)
    }, 1000)
  }

  return (
    <div className='max-w-md mx-auto bg-white min-h-screen relative pb-32'>
      <DashboardHeader
        isLive={actuallyStreaming}
        onToggleAppMode={onToggleAppMode}
      />

      {/* Stream Title Section */}
      <div className='p-4 border-b border-gray-200'>
        <div className='text-sm text-gray-500 mb-1'>Stream Title</div>
        {isEditingTitle ? (
          <div className='flex gap-2 items-center'>
            <Input
              value={streamTitle}
              onChange={e => setStreamTitle(e.target.value)}
              placeholder='Stream title...'
              className='flex-1 rounded-full text-sm'
              autoFocus
            />
            <Button
              onClick={handleSaveTitle}
              size='sm'
              className='rounded-full px-3'
            >
              <Save className='h-4 w-4' />
            </Button>
          </div>
        ) : (
          <div className='flex items-center justify-between'>
            <div className='text-sm font-medium flex-1 pr-2'>{streamTitle}</div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setIsEditingTitle(true)}
              className='rounded-full px-2'
            >
              <Edit className='h-4 w-4' />
            </Button>
          </div>
        )}
      </div>

      {/* Stream Component */}
      {isClient && (
        <div className='p-4 border-b border-gray-200'>
          <StreamComponent
            streamIdToUse={streamIdForComponent}
            initiateStream={isLive}
            onStreamStatusUpdate={handleStreamStatusUpdate}
          />
        </div>
      )}

      <DashboardStats
        viewerCount={viewerCount}
        totalTips={totalTips}
        recentMessagesCount={recentMessages.length}
        isLive={isLive}
        onToggleLive={handleToggleLive}
      />

      <ChatActivityMonitor
        chatEnabled={chatEnabled}
        onDeleteMessage={handleDeleteMessage}
        onBanUser={handleBanUser}
        onTipComment={handleOpenTipCommentModal}
        streamId={dashboardApiStream?.id}
        messages={recentMessages}
      />

      <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center w-[calc(100%-2rem)] max-w-md z-20'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleOpenSprinkleModal}
                className='w-56 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full shadow-lg h-14'
                size='lg'
                disabled={!actuallyStreaming || !isClient}
              >
                <Sparkles className='h-6 w-6 mr-2' /> Sprinkle Tips
              </Button>
            </TooltipTrigger>
            <TooltipContent side='top'>
              <p>Randomly tip verified viewers (Stream must be live)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <TipCommentModal
        isOpen={streamerTipModalOpen}
        selectedMessage={selectedMessageForTip}
        onClose={() => setStreamerTipModalOpen(false)}
        onSubmitTip={handleSubmitStreamerTip}
      />
      <SprinkleTipsModal
        isOpen={sprinkleModalOpen}
        onClose={() => {
          setSprinkleModalOpen(false)
          setSprinkleComplete(false)
          setSprinkleInProgress(false)
        }}
        onSubmitSprinkle={handleSubmitSprinkle}
      />
    </div>
  )
}
