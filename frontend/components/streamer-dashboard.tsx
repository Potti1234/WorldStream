'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Settings, Sparkles, Video, VideoOff } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Slider } from '@/components/ui/slider'

import { DashboardHeader } from './dashboard-header'
import { DashboardStats } from './dashboard-stats'
import { ChatActivityMonitor } from './chat-activity-monitor'
import { StreamerTipModal } from './streamer-tip-modal'
import { SprinkleTipsModal } from './sprinkle-tips-modal'
import { StreamSettingsView } from './stream-settings-view'
import StreamComponent from './streamComponent'
import type { DashboardMessage } from '@/app/types'

interface StreamerDashboardProps {
  onToggleAppMode: () => void
  appMode: 'viewer' | 'streamer'
}

export function StreamerDashboard ({ onToggleAppMode }: StreamerDashboardProps) {
  const [isLive, setIsLive] = useState(false)
  const [actuallyStreaming, setActuallyStreaming] = useState(false)
  const [streamIdForComponent, setStreamIdForComponent] = useState(
    'streamerDashboardStream'
  )
  const [streamTitle, setStreamTitle] = useState(
    'Epic Valorant Ranked Climb! Road to Radiant 🔥'
  )
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [chatEnabled, setChatEnabled] = useState(true)
  const [tipsEnabled, setTipsEnabled] = useState(true)
  const [viewerCount, setViewerCount] = useState(0)
  const [totalTips, setTotalTips] = useState(0)
  const [showSettings, setShowSettings] = useState(false)

  const [streamerTipModalOpen, setStreamerTipModalOpen] = useState(false)
  const [selectedMessageForTip, setSelectedMessageForTip] =
    useState<DashboardMessage | null>(null)

  const [sprinkleModalOpen, setSprinkleModalOpen] = useState(false)
  const [sprinkleInProgress, setSprinkleInProgress] = useState(false)
  const [sprinkleComplete, setSprinkleComplete] = useState(false)

  const [recentMessages, setRecentMessages] = useState<DashboardMessage[]>([
    {
      id: '1',
      username: 'viewer123',
      message: 'Great stream!',
      timestamp: '3:45 PM'
    },
    {
      id: '2',
      username: 'gamer_fan',
      message: 'Amazing gameplay!',
      timestamp: '3:42 PM'
    },
    {
      id: '3',
      username: 'new_sub',
      message: 'Just subscribed!',
      timestamp: '3:40 PM'
    },
    {
      id: '4',
      username: 'TipMaster',
      message: 'Here is a tip!',
      timestamp: '3:38 PM',
      isTip: true,
      streamerTip: 5,
      isStreamerTip: true
    }
  ])

  useEffect(() => {
    if (!actuallyStreaming) {
      setViewerCount(0)
      return
    }
    const interval = setInterval(
      () =>
        setViewerCount(prev =>
          Math.max(0, prev + Math.floor(Math.random() * 21) - 10)
        ),
      5000
    )
    return () => clearInterval(interval)
  }, [actuallyStreaming])

  useEffect(() => {
    if (!chatEnabled || !actuallyStreaming) return
    const names = ['alpha', 'beta', 'gamma', 'delta', 'epsilon']
    const texts = ['Nice one!', 'Keep it up!', 'Awesome stream!', 'So cool!']
    const interval = setInterval(() => {
      const newMessage: DashboardMessage = {
        id: Date.now().toString(),
        username: `${
          names[Math.floor(Math.random() * names.length)]
        }${Math.floor(Math.random() * 100)}`,
        message: texts[Math.floor(Math.random() * texts.length)],
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      setRecentMessages(prev => [newMessage, ...prev.slice(0, 9)])
    }, 8000)
    return () => clearInterval(interval)
  }, [chatEnabled, actuallyStreaming])

  const handleToggleLive = () => {
    setIsLive(!isLive)
  }

  const handleStreamStatusUpdate = (
    isActuallyStreaming: boolean,
    activeStreamId: string | null
  ) => {
    setActuallyStreaming(isActuallyStreaming)
    console.log(
      `Dashboard: Stream status update: isActuallyStreaming=${isActuallyStreaming}, activeStreamId=${activeStreamId}`
    )
    if (isActuallyStreaming && activeStreamId !== streamIdForComponent) {
      console.warn(
        `Dashboard: Stream started with ID ${activeStreamId} which differs from intended ${streamIdForComponent}`
      )
    }
    if (!isActuallyStreaming && isLive) {
      setIsLive(false)
    }
  }

  const handleSaveTitle = () => setIsEditingTitle(false)
  const handleDeleteMessage = (id: string) =>
    setRecentMessages(prev => prev.filter(msg => msg.id !== id))
  const handleBanUser = (username: string) =>
    setRecentMessages(prev => prev.filter(msg => msg.username !== username))

  const handleOpenTipCommentModal = (message: DashboardMessage) => {
    setSelectedMessageForTip(message)
    setStreamerTipModalOpen(true)
  }

  const handleSubmitStreamerTip = (tipAmount: string) => {
    if (!selectedMessageForTip) return
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

  if (showSettings) {
    return (
      <StreamSettingsView
        streamTitle={streamTitle}
        setStreamTitle={setStreamTitle}
        isEditingTitle={isEditingTitle}
        setIsEditingTitle={setIsEditingTitle}
        handleSaveTitle={handleSaveTitle}
        chatEnabled={chatEnabled}
        setChatEnabled={setChatEnabled}
        tipsEnabled={tipsEnabled}
        setTipsEnabled={setTipsEnabled}
        onClose={() => setShowSettings(false)}
      />
    )
  }

  return (
    <div className='max-w-md mx-auto bg-white min-h-screen relative pb-20 flex flex-col'>
      <DashboardHeader
        isLive={actuallyStreaming}
        onToggleAppMode={onToggleAppMode}
        onToggleLive={handleToggleLive}
        onShowSettings={() => setShowSettings(true)}
      />
      <div className='p-4'>
        <div className='mb-4'>
          <label
            htmlFor='streamIdInput'
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            Stream ID
          </label>
          <input
            id='streamIdInput'
            type='text'
            value={streamIdForComponent}
            onChange={e => setStreamIdForComponent(e.target.value)}
            disabled={isLive || actuallyStreaming}
            className='w-full p-2 border border-gray-300 rounded-md mb-2'
          />
          <StreamComponent
            streamIdToUse={streamIdForComponent}
            initiateStream={isLive}
            onStreamStatusUpdate={handleStreamStatusUpdate}
          />
        </div>

        <Button
          onClick={handleToggleLive}
          variant={actuallyStreaming ? 'destructive' : 'default'}
          className='w-full mb-4 h-12 text-lg'
          disabled={!streamIdForComponent.trim()}
        >
          {actuallyStreaming ? (
            <VideoOff className='mr-2 h-5 w-5' />
          ) : (
            <Video className='mr-2 h-5 w-5' />
          )}
          {actuallyStreaming ? 'Stop Stream' : 'Go Live'}
        </Button>
      </div>

      <DashboardStats
        viewerCount={viewerCount}
        totalTips={totalTips}
        recentMessagesCount={recentMessages.length}
      />
      <div className='p-4 border-b border-gray-200'>
        <div className='text-sm text-gray-500 mb-1'>Stream Title</div>
        <div className='text-sm font-medium'>{streamTitle}</div>
      </div>

      <ChatActivityMonitor
        chatEnabled={chatEnabled}
        recentMessages={recentMessages}
        onDeleteMessage={handleDeleteMessage}
        onBanUser={handleBanUser}
        onTipComment={handleOpenTipCommentModal}
      />

      <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-20'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleOpenSprinkleModal}
                className='w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full shadow-lg h-14'
                size='lg'
                disabled={!actuallyStreaming}
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

      <StreamerTipModal
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
