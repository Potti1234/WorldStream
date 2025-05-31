'use client'

import { useState, useEffect, useRef } from 'react'
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
  MessageCircle
} from 'lucide-react'
import type { Streamer } from '@/app/page'

interface StreamViewProps {
  streamer: Streamer
  onBack: () => void
}

interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: string
  isTip?: boolean
  tipAmount?: number
  tipsReceived?: { username: string; amount: number }[]
  streamerTip?: number
  isStreamerTip?: boolean
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
    message: 'OMG that was so close! My heart is racing 💓',
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

export function StreamView ({ streamer, onBack }: StreamViewProps) {
  const [message, setMessage] = useState('')
  const [tipAmount, setTipAmount] = useState('')
  const [showTipInput, setShowTipInput] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
  const [tipModalOpen, setTipModalOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(
    null
  )
  const [commentTipAmount, setCommentTipAmount] = useState('')
  const [userMessageIds, setUserMessageIds] = useState<string[]>([])
  const [inputAreaHeight, setInputAreaHeight] = useState(64) // Default height for input area
  const inputAreaRef = useRef<HTMLDivElement>(null)

  // Update input area height when it changes
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
  }, [showTipInput])

  const handleSendMessage = () => {
    if (!message.trim()) return

    const messageId = Date.now().toString()
    const newMessage: ChatMessage = {
      id: messageId,
      username: 'You',
      message: message.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    setMessages(prev => [...prev, newMessage])
    setUserMessageIds(prev => [...prev, messageId])
    setMessage('')

    // Simulate community tips on user's message
    simulateCommunityTips(messageId)
  }

  const handleSendTip = () => {
    if (!tipAmount || !message.trim()) return

    const newTip: ChatMessage = {
      id: Date.now().toString(),
      username: 'You',
      message: message.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      isTip: true,
      tipAmount: Number.parseFloat(tipAmount)
    }

    setMessages(prev => [...prev, newTip])
    setMessage('')
    setTipAmount('')
    setShowTipInput(false)
  }

  const handleTipComment = (message: ChatMessage) => {
    setSelectedMessage(message)
    setCommentTipAmount('')
    setTipModalOpen(true)
  }

  const submitCommentTip = () => {
    if (!selectedMessage || !commentTipAmount) return

    const amount = Number.parseFloat(commentTipAmount)
    if (isNaN(amount) || amount <= 0) return

    setMessages(prev =>
      prev.map(msg => {
        if (msg.id === selectedMessage.id) {
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

    // Add a system message about the tip
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
    setCommentTipAmount('')
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

    // Random chance of getting tips (70% chance)
    if (Math.random() > 0.3) {
      // Random delay between 2-8 seconds
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

        // Add a notification message
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

      // Chance of getting a second tip (30% chance)
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

  return (
    <div className='max-w-md mx-auto bg-white min-h-screen relative'>
      {/* Header */}
      <div className='sticky top-0 bg-white border-b border-gray-200 p-4 z-10'>
        <div className='flex items-center gap-3'>
          <Button
            variant='ghost'
            size='icon'
            onClick={onBack}
            className='flex-shrink-0 rounded-full'
          >
            <ArrowLeft className='w-5 h-5' />
          </Button>
          <Avatar className='w-8 h-8'>
            <AvatarImage
              src={streamer.avatar || '/placeholder.svg'}
              alt={streamer.name}
            />
            <AvatarFallback className='text-xs'>
              {streamer.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <p className='font-medium text-sm truncate'>{streamer.name}</p>
            <div className='flex items-center gap-2'>
              <Badge variant='destructive' className='text-xs rounded-full'>
                LIVE
              </Badge>
              <div className='flex items-center gap-1 text-xs text-gray-500'>
                <Users className='w-3 h-3' />
                <span>{streamer.viewers.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stream Info */}
      <div className='p-4 border-b border-gray-200'>
        <h2 className='font-medium text-sm mb-1'>{streamer.title}</h2>
        <Badge variant='secondary' className='text-xs rounded-full'>
          {streamer.category}
        </Badge>
      </div>

      {/* Chat */}
      <div className='flex flex-col' style={{ height: 'calc(100vh - 200px)' }}>
        <div className='flex items-center gap-2 p-3 border-b border-gray-200'>
          <MessageCircle className='w-4 h-4' />
          <span className='text-sm font-medium'>Live Chat</span>
        </div>

        <ScrollArea
          className='flex-1 p-3'
          style={{ paddingBottom: `${inputAreaHeight + 12}px` }}
        >
          <div className='space-y-3 pr-4'>
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2 text-sm ${
                  msg.tipsReceived && msg.tipsReceived.length > 0
                    ? msg.username === 'You'
                      ? 'bg-green-50 border border-green-200 rounded-lg p-2 -m-1'
                      : 'bg-blue-50/50 border-l-2 border-blue-200 pl-3 py-1 -ml-1'
                    : msg.streamerTip
                    ? 'bg-yellow-50 border border-yellow-200 rounded-lg p-2 -m-1'
                    : ''
                }`}
              >
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='font-medium text-xs'>{msg.username}</span>
                    <span className='text-xs text-gray-400'>
                      {msg.timestamp}
                    </span>
                    {msg.isTip && (
                      <Badge
                        variant='default'
                        className='text-xs bg-green-500 rounded-full'
                      >
                        <DollarSign className='w-3 h-3 mr-1' />${msg.tipAmount}
                      </Badge>
                    )}
                    {msg.isStreamerTip && (
                      <Badge
                        variant='outline'
                        className='text-xs bg-purple-50 text-purple-600 border-purple-200 rounded-full'
                      >
                        STREAMER
                      </Badge>
                    )}
                    {msg.streamerTip && (
                      <Badge
                        variant='outline'
                        className='text-xs bg-yellow-500 text-white rounded-full'
                      >
                        <DollarSign className='w-3 h-3 mr-1' />
                        Streamer tipped ${msg.streamerTip}
                      </Badge>
                    )}
                  </div>
                  <p className='text-sm leading-relaxed'>{msg.message}</p>

                  {/* Show tips received */}
                  {msg.tipsReceived && msg.tipsReceived.length > 0 && (
                    <div className='mt-2 space-y-1'>
                      {/* Tip Summary */}
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant='default'
                          className='text-xs bg-green-600 text-white rounded-full'
                        >
                          <DollarSign className='w-3 h-3 mr-1' />$
                          {msg.tipsReceived.reduce(
                            (total, tip) => total + tip.amount,
                            0
                          )}{' '}
                          total
                        </Badge>
                        <Badge
                          variant='outline'
                          className='text-xs border-green-500 text-green-600 rounded-full'
                        >
                          {msg.tipsReceived.length}{' '}
                          {msg.tipsReceived.length === 1 ? 'tip' : 'tips'}
                        </Badge>
                      </div>

                      {/* Individual Tips */}
                      <div className='flex flex-wrap gap-1'>
                        {msg.tipsReceived.map((tip, i) => (
                          <Badge
                            key={i}
                            variant='outline'
                            className='text-xs border-gray-300 text-gray-600 rounded-full'
                          >
                            <DollarSign className='w-3 h-3 mr-1' />
                            {tip.amount} from {tip.username}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Only show tip button for others' messages */}
                {msg.username !== 'You' &&
                  msg.username !== 'System' &&
                  !msg.isStreamerTip && (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 flex-shrink-0 text-gray-500 hover:text-green-500 rounded-full'
                      onClick={() => handleTipComment(msg)}
                    >
                      <DollarSign className='w-4 h-4' />
                    </Button>
                  )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Fixed Input Area at Bottom */}
      <div
        ref={inputAreaRef}
        className='fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 p-3 z-20'
      >
        {showTipInput && (
          <div className='space-y-3 mb-3'>
            <div className='text-sm font-medium'>Select tip amount:</div>
            <div className='grid grid-cols-4 gap-2'>
              {[1, 2, 5, 10].map(amount => (
                <Button
                  key={amount}
                  variant={
                    tipAmount === amount.toString() ? 'default' : 'outline'
                  }
                  size='sm'
                  onClick={() => setTipAmount(amount.toString())}
                  className='text-xs rounded-full'
                >
                  ${amount}
                </Button>
              ))}
            </div>
            <div className='flex gap-2'>
              <Input
                placeholder='Custom amount'
                value={
                  tipAmount && ![1, 2, 5, 10].includes(Number(tipAmount))
                    ? tipAmount
                    : ''
                }
                onChange={e => setTipAmount(e.target.value)}
                type='number'
                min='0.50'
                step='0.50'
                className='flex-1 rounded-full'
              />
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowTipInput(false)}
                className='rounded-full'
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className='flex gap-2'>
          <Input
            placeholder='Send a message...'
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyPress={e =>
              e.key === 'Enter' &&
              (showTipInput ? handleSendTip() : handleSendMessage())
            }
            className='flex-1 rounded-full'
          />
          {!showTipInput ? (
            <>
              <Button
                variant='outline'
                size='icon'
                onClick={() => setShowTipInput(true)}
                className='flex-shrink-0 rounded-full'
              >
                <DollarSign className='w-4 h-4' />
              </Button>
              <Button
                size='icon'
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className='flex-shrink-0 rounded-full'
              >
                <Send className='w-4 h-4' />
              </Button>
            </>
          ) : (
            <Button
              size='icon'
              onClick={handleSendTip}
              disabled={!message.trim() || !tipAmount}
              className='flex-shrink-0 bg-green-500 hover:bg-green-600 rounded-full'
            >
              <Heart className='w-4 h-4' />
            </Button>
          )}
        </div>
      </div>

      {/* Tip Modal */}
      {tipModalOpen && selectedMessage && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-4 w-[90%] max-w-sm'>
            <h3 className='font-medium mb-2'>Tip {selectedMessage.username}</h3>
            <p className='text-sm text-gray-600 mb-4'>
              "{selectedMessage.message}"
            </p>

            <div className='space-y-4'>
              <div>
                <div className='text-sm font-medium mb-2'>
                  Select tip amount:
                </div>
                <div className='grid grid-cols-4 gap-2 mb-3'>
                  {[1, 2, 5, 10].map(amount => (
                    <Button
                      key={amount}
                      variant={
                        commentTipAmount === amount.toString()
                          ? 'default'
                          : 'outline'
                      }
                      size='sm'
                      onClick={() => setCommentTipAmount(amount.toString())}
                      className='text-xs rounded-full'
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
                <Input
                  type='number'
                  placeholder='Custom amount ($)'
                  value={
                    commentTipAmount &&
                    ![1, 2, 5, 10].includes(Number(commentTipAmount))
                      ? commentTipAmount
                      : ''
                  }
                  onChange={e => setCommentTipAmount(e.target.value)}
                  min='0.50'
                  step='0.50'
                  className='w-full rounded-full'
                />
              </div>

              <div className='flex gap-2 justify-end'>
                <Button
                  variant='outline'
                  onClick={() => setTipModalOpen(false)}
                  className='rounded-full'
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitCommentTip}
                  disabled={!commentTipAmount || Number(commentTipAmount) <= 0}
                  className='bg-green-500 hover:bg-green-600 rounded-full'
                >
                  Send Tip
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
