'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users,
  DollarSign,
  MessageSquare,
  Settings,
  Ban,
  Edit,
  Save,
  Trash2,
  ArrowLeft,
  Sparkles
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Slider } from '@/components/ui/slider'

interface StreamerDashboardProps {
  onToggleAppMode: () => void
  appMode: 'viewer' | 'streamer'
}

export function StreamerDashboard ({
  onToggleAppMode,
  appMode
}: StreamerDashboardProps) {
  const [isLive, setIsLive] = useState(true)
  const [streamTitle, setStreamTitle] = useState(
    'Epic Valorant Ranked Climb! Road to Radiant 🔥'
  )
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [chatEnabled, setChatEnabled] = useState(true)
  const [tipsEnabled, setTipsEnabled] = useState(true)
  const [viewerCount, setViewerCount] = useState(2847)
  const [totalTips, setTotalTips] = useState(342.5)
  const [showSettings, setShowSettings] = useState(false)

  const [tipModalOpen, setTipModalOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [streamerTipAmount, setStreamerTipAmount] = useState('')

  // New state for sprinkle tip feature
  const [sprinkleTipModalOpen, setSprinkleTipModalOpen] = useState(false)
  const [sprinkleTipAmount, setSprinkleTipAmount] = useState('5')
  const [sprinkleTipRecipients, setSprinkleTipRecipients] = useState(5)
  const [sprinkleInProgress, setSprinkleInProgress] = useState(false)
  const [sprinkleComplete, setSprinkleComplete] = useState(false)

  const [recentMessages, setRecentMessages] = useState([
    {
      id: '1',
      username: 'viewer123',
      message: 'Great stream! Keep it up!',
      timestamp: '3:45 PM'
    },
    {
      id: '2',
      username: 'gaming_enthusiast',
      message: 'That was an amazing play! How did you do that?',
      timestamp: '3:42 PM'
    },
    {
      id: '3',
      username: 'new_follower',
      message: 'Just followed! Love your content',
      timestamp: '3:40 PM'
    },
    {
      id: '4',
      username: 'GenerousViewer',
      message: 'Tipped $5.00: Love your content! Keep it up!',
      timestamp: '3:38 PM',
      isTip: true,
      streamerTip: 5,
      isStreamerTip: true
    },
    {
      id: '5',
      username: 'question_asker',
      message: "What's your sensitivity settings?",
      timestamp: '3:35 PM'
    }
  ])

  // Simulate viewer count changes
  useEffect(() => {
    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * 21) - 10
      setViewerCount(prev => Math.max(1, prev + change))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Simulate new messages
  useEffect(() => {
    if (!chatEnabled) return

    const interval = setInterval(() => {
      const messages = [
        'Love this stream!',
        'How long have you been playing?',
        'That was sick!',
        'Just followed!',
        "What's your rank?",
        'GG that round!',
        'Your aim is insane',
        'Can you play some music?'
      ]
      const usernames = [
        'viewer' + Math.floor(Math.random() * 1000),
        'fan_' + Math.floor(Math.random() * 100)
      ]

      const newMessage = {
        id: Date.now().toString(),
        username: usernames[Math.floor(Math.random() * usernames.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      }

      setRecentMessages(prev => [newMessage, ...prev.slice(0, 9)])
    }, 8000)

    return () => clearInterval(interval)
  }, [chatEnabled])

  const handleToggleLive = () => {
    setIsLive(!isLive)
  }

  const handleSaveTitle = () => {
    setIsEditingTitle(false)
  }

  const handleDeleteMessage = (id: string) => {
    setRecentMessages(prev => prev.filter(msg => msg.id !== id))
  }

  const handleBanUser = (username: string) => {
    setRecentMessages(prev => prev.filter(msg => msg.username !== username))
  }

  const handleTipComment = (message: any) => {
    setSelectedMessage(message)
    setStreamerTipAmount('')
    setTipModalOpen(true)
  }

  const submitStreamerTip = () => {
    if (!selectedMessage || !streamerTipAmount) return

    const amount = Number.parseFloat(streamerTipAmount)
    if (isNaN(amount) || amount <= 0) return

    // Update the message to show it received a streamer tip
    setRecentMessages(prev =>
      prev.map(msg => {
        if (msg.id === selectedMessage.id) {
          return {
            ...msg,
            streamerTip: amount,
            isTip: msg.isTip || false,
            isStreamerTip: true
          }
        }
        return msg
      })
    )

    // Add a system message about the streamer tip
    const newMessage = {
      id: Date.now().toString(),
      username: 'System',
      message: `Streamer tipped ${selectedMessage.username} $${amount.toFixed(
        2
      )}! 🎉`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      streamerTip: amount,
      isStreamerTip: true,
      isTip: true
    }

    setRecentMessages(prev => [newMessage, ...prev.slice(0, 19)])
    setTipModalOpen(false)
    setSelectedMessage(null)
    setStreamerTipAmount('')
  }

  // Handle opening the sprinkle tip modal
  const handleOpenSprinkleTipModal = () => {
    setSprinkleTipModalOpen(true)
    setSprinkleTipAmount('5')
    setSprinkleTipRecipients(5)
    setSprinkleComplete(false)
  }

  // Handle submitting the sprinkle tip
  const handleSprinkleTip = () => {
    const amount = Number.parseFloat(sprinkleTipAmount)
    if (isNaN(amount) || amount <= 0) return

    setSprinkleInProgress(true)

    // Generate random usernames for the recipients
    const randomUsernames = [
      'verified_fan1',
      'verified_fan2',
      'verified_fan3',
      'verified_fan4',
      'verified_fan5',
      'verified_fan6',
      'verified_fan7',
      'verified_fan8',
      'verified_fan9',
      'verified_fan10',
      'verified_fan11',
      'verified_fan12',
      'verified_fan13',
      'verified_fan14',
      'verified_fan15'
    ]

    // Shuffle and take the requested number of recipients
    const shuffled = [...randomUsernames].sort(() => 0.5 - Math.random())
    const selectedRecipients = shuffled.slice(0, sprinkleTipRecipients)

    // Calculate individual tip amount (divide total by number of recipients)
    const individualAmount = Number.parseFloat(
      (amount / sprinkleTipRecipients).toFixed(2)
    )
    const totalAmount = individualAmount * sprinkleTipRecipients

    // Simulate distributing tips with a delay
    setTimeout(() => {
      // Add a system message about the sprinkle tip
      const newMessage = {
        id: Date.now().toString(),
        username: 'System',
        message: `Streamer sprinkled $${totalAmount.toFixed(
          2
        )} to ${sprinkleTipRecipients} verified viewers! Each received $${individualAmount.toFixed(
          2
        )} 🎉✨`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        isStreamerTip: true,
        isTip: true,
        streamerTip: totalAmount
      }

      setRecentMessages(prev => [newMessage, ...prev.slice(0, 19)])

      // Add individual recipient messages with slight delays
      selectedRecipients.forEach((username, index) => {
        setTimeout(() => {
          const recipientMessage = {
            id: Date.now().toString() + index,
            username: 'System',
            message: `${username} received $${individualAmount.toFixed(
              2
            )} from your sprinkle! 💸`,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
            isStreamerTip: true,
            isTip: true,
            streamerTip: individualAmount
          }
          setRecentMessages(prev => [recipientMessage, ...prev.slice(0, 19)])
        }, index * 300) // Stagger the messages
      })

      setSprinkleInProgress(false)
      setSprinkleComplete(true)

      // Close modal after showing completion for a moment
      setTimeout(() => {
        setSprinkleTipModalOpen(false)
      }, 1500)
    }, 1000)
  }

  if (showSettings) {
    return (
      <div className='max-w-md mx-auto bg-white min-h-screen'>
        {/* Settings Header */}
        <div className='sticky top-0 bg-white border-b border-gray-200 p-4 z-10'>
          <div className='flex items-center justify-between'>
            <h1 className='text-xl font-bold'>Settings</h1>
            <Button
              variant='ghost'
              onClick={() => setShowSettings(false)}
              className='rounded-full'
            >
              Done
            </Button>
          </div>
        </div>

        {/* Settings Content */}
        <div className='p-4 space-y-6'>
          {/* Stream Title */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>Stream Title</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {isEditingTitle ? (
                <div className='space-y-2'>
                  <Input
                    value={streamTitle}
                    onChange={e => setStreamTitle(e.target.value)}
                    placeholder='Enter stream title...'
                    className='rounded-full'
                  />
                  <Button
                    onClick={handleSaveTitle}
                    size='sm'
                    className='w-full rounded-full'
                  >
                    <Save className='h-4 w-4 mr-2' /> Save Title
                  </Button>
                </div>
              ) : (
                <div className='space-y-2'>
                  <p className='text-sm text-gray-600'>{streamTitle}</p>
                  <Button
                    variant='outline'
                    onClick={() => setIsEditingTitle(true)}
                    size='sm'
                    className='w-full rounded-full'
                  >
                    <Edit className='h-4 w-4 mr-2' /> Edit Title
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Settings */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>Chat Settings</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='verified-only'>Verified Users Only</Label>
                <Switch id='verified-only' />
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='slow-mode'>Slow Mode</Label>
                <Switch id='slow-mode' />
              </div>
              <Button
                variant='destructive'
                size='sm'
                className='w-full rounded-full'
              >
                <Ban className='h-4 w-4 mr-2' /> Clear Chat
              </Button>
            </CardContent>
          </Card>

          {/* Stream URL */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>Stream URL</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='space-y-2'>
                <Label htmlFor='stream-url'>External Stream URL</Label>
                <Input
                  id='stream-url'
                  placeholder='https://your-streaming-device-url.com'
                  className='w-full rounded-full'
                />
                <p className='text-xs text-gray-500'>
                  Add a URL from another streaming device or software
                </p>
              </div>
              <Button size='sm' className='w-full rounded-full'>
                Save Stream URL
              </Button>
            </CardContent>
          </Card>

          {/* Tip Settings */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base'>Tip Settings</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='tips-enabled'>Enable Tips</Label>
                <Switch
                  id='tips-enabled'
                  checked={tipsEnabled}
                  onCheckedChange={setTipsEnabled}
                />
              </div>
              <div className='flex items-center justify-between'>
                <Label htmlFor='tip-alerts'>Tip Alerts</Label>
                <Switch id='tip-alerts' defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-md mx-auto bg-white min-h-screen relative pb-20'>
      {/* Header */}
      <div className='sticky top-0 bg-white border-b border-gray-200 p-4 z-10'>
        {/* Header */}
        <div className='flex items-center gap-3 mb-3'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={onToggleAppMode}
                  className='flex-shrink-0 rounded-full'
                  aria-label='Back to Viewer Mode'
                >
                  <ArrowLeft className='h-5 w-5' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Back to Viewer Mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Avatar className='h-10 w-10'>
            <AvatarImage
              src='/placeholder.svg?height=40&width=40'
              alt='Streamer'
            />
            <AvatarFallback>SM</AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <h1 className='text-lg font-bold'>Streamer Mode</h1>
            <Badge
              variant={isLive ? 'destructive' : 'outline'}
              className='text-xs rounded-full'
            >
              {isLive ? 'LIVE' : 'OFFLINE'}
            </Badge>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setShowSettings(true)}
            className='rounded-full'
          >
            <Settings className='h-5 w-5' />
          </Button>
        </div>

        {/* Live Toggle */}
        <Button
          onClick={handleToggleLive}
          variant={isLive ? 'destructive' : 'default'}
          className='w-full rounded-full'
          size='lg'
        >
          {isLive ? 'End Stream' : 'Go Live'}
        </Button>
      </div>

      {/* Stats */}
      <div className='p-4 border-b border-gray-200'>
        <div className='grid grid-cols-3 gap-4'>
          <div className='text-center'>
            <div className='flex items-center justify-center mb-1'>
              <Users className='h-4 w-4 text-blue-500 mr-1' />
            </div>
            <div className='text-lg font-bold'>
              {viewerCount.toLocaleString()}
            </div>
            <div className='text-xs text-gray-500'>Viewers</div>
          </div>
          <div className='text-center'>
            <div className='flex items-center justify-center mb-1'>
              <DollarSign className='h-4 w-4 text-green-500 mr-1' />
            </div>
            <div className='text-lg font-bold'>${totalTips.toFixed(0)}</div>
            <div className='text-xs text-gray-500'>Tips</div>
          </div>
          <div className='text-center'>
            <div className='flex items-center justify-center mb-1'>
              <MessageSquare className='h-4 w-4 text-purple-500 mr-1' />
            </div>
            <div className='text-lg font-bold'>{recentMessages.length}</div>
            <div className='text-xs text-gray-500'>Messages</div>
          </div>
        </div>
      </div>

      {/* Stream Title */}
      <div className='p-4 border-b border-gray-200'>
        <div className='text-sm text-gray-500 mb-1'>Stream Title</div>
        <div className='text-sm font-medium'>{streamTitle}</div>
      </div>

      {/* Chat Monitor */}
      <div className='flex-1'>
        <div className='p-4 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <h2 className='text-base font-medium'>Live Chat</h2>
            <Badge
              variant={chatEnabled ? 'default' : 'secondary'}
              className='text-xs rounded-full'
            >
              {chatEnabled ? 'ON' : 'OFF'}
            </Badge>
          </div>
        </div>

        <ScrollArea className='h-[450px]'>
          <div className='p-4'>
            {recentMessages.map(msg => (
              <div
                key={msg.id}
                className={`py-2 border-b border-gray-100 last:border-0 ${
                  msg.streamerTip
                    ? 'bg-yellow-50 border-yellow-200 rounded-lg p-2 -m-1'
                    : ''
                }`}
              >
                <div className='flex justify-between items-start'>
                  <div className='flex items-start space-x-2 flex-1'>
                    <Avatar className='h-6 w-6 flex-shrink-0'>
                      <AvatarFallback className='text-xs'>
                        {msg.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center space-x-2'>
                        <span className='text-sm font-medium truncate'>
                          {msg.username}
                        </span>
                        {msg.isTip && (
                          <Badge
                            variant='outline'
                            className='text-xs bg-green-50 text-green-600 border-green-200 rounded-full'
                          >
                            TIP
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
                            className='text-xs bg-yellow-50 text-yellow-600 border-yellow-200 rounded-full'
                          >
                            <DollarSign className='h-3 w-3 mr-1' />$
                            {msg.streamerTip}
                          </Badge>
                        )}
                        <span className='text-xs text-gray-400'>
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className='text-sm mt-1 break-words'>{msg.message}</p>
                    </div>
                  </div>
                  <div className='flex space-x-2 ml-2'>
                    {!msg.isStreamerTip && msg.username !== 'System' && (
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-9 w-9 p-0 text-gray-400 hover:text-green-500 rounded-full'
                        onClick={() => handleTipComment(msg)}
                      >
                        <DollarSign className='h-4 w-4' />
                      </Button>
                    )}
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-9 w-9 p-0 text-gray-400 hover:text-red-500 rounded-full'
                      onClick={() => handleDeleteMessage(msg.id)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-9 w-9 p-0 text-gray-400 hover:text-red-500 rounded-full'
                      onClick={() => handleBanUser(msg.username)}
                    >
                      <Ban className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Fixed Sprinkle Button at Bottom */}
      <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-20'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleOpenSprinkleTipModal}
                className='w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full shadow-lg h-14'
                size='lg'
              >
                <Sparkles className='h-6 w-6 mr-2' /> Sprinkle Tips to Verified
                Viewers
              </Button>
            </TooltipTrigger>
            <TooltipContent side='top'>
              <p>Randomly distribute tips to verified viewers in your stream</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Streamer Tip Modal */}
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
                        streamerTipAmount === amount.toString()
                          ? 'default'
                          : 'outline'
                      }
                      size='sm'
                      onClick={() => setStreamerTipAmount(amount.toString())}
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
                    streamerTipAmount &&
                    ![1, 2, 5, 10].includes(Number(streamerTipAmount))
                      ? streamerTipAmount
                      : ''
                  }
                  onChange={e => setStreamerTipAmount(e.target.value)}
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
                  onClick={submitStreamerTip}
                  disabled={
                    !streamerTipAmount || Number(streamerTipAmount) <= 0
                  }
                  className='bg-green-500 hover:bg-green-600 rounded-full'
                >
                  Send Tip
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sprinkle Tip Modal */}
      {sprinkleTipModalOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-4 w-[90%] max-w-sm'>
            <h3 className='font-medium mb-2'>
              Sprinkle Tips to Verified Viewers
            </h3>
            <p className='text-sm text-gray-600 mb-4'>
              Randomly distribute tips to verified viewers in your stream. The
              total amount will be divided equally among recipients.
            </p>

            {!sprinkleComplete ? (
              <div className='space-y-4'>
                <div>
                  <div className='text-sm font-medium mb-2'>
                    Total amount to distribute:
                  </div>
                  <div className='grid grid-cols-4 gap-2 mb-3'>
                    {[5, 10, 20, 50].map(amount => (
                      <Button
                        key={amount}
                        variant={
                          sprinkleTipAmount === amount.toString()
                            ? 'default'
                            : 'outline'
                        }
                        size='sm'
                        onClick={() => setSprinkleTipAmount(amount.toString())}
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
                      sprinkleTipAmount &&
                      ![5, 10, 20, 50].includes(Number(sprinkleTipAmount))
                        ? sprinkleTipAmount
                        : ''
                    }
                    onChange={e => setSprinkleTipAmount(e.target.value)}
                    min='1'
                    step='1'
                    className='w-full rounded-full'
                  />
                </div>

                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <Label className='text-sm font-medium'>
                      Number of recipients: {sprinkleTipRecipients}
                    </Label>
                  </div>
                  <Slider
                    defaultValue={[5]}
                    min={1}
                    max={15}
                    step={1}
                    onValueChange={value => setSprinkleTipRecipients(value[0])}
                    className='mb-2'
                  />
                  <p className='text-xs text-gray-500'>
                    Each viewer will receive $
                    {sprinkleTipAmount && sprinkleTipRecipients
                      ? (
                          Number(sprinkleTipAmount) / sprinkleTipRecipients
                        ).toFixed(2)
                      : '0.00'}
                  </p>
                </div>

                <div className='flex gap-2 justify-end'>
                  <Button
                    variant='outline'
                    onClick={() => setSprinkleTipModalOpen(false)}
                    className='rounded-full'
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSprinkleTip}
                    disabled={
                      !sprinkleTipAmount ||
                      Number(sprinkleTipAmount) <= 0 ||
                      sprinkleInProgress
                    }
                    className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full'
                  >
                    {sprinkleInProgress ? (
                      <div className='flex items-center'>
                        <div className='animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full'></div>
                        Sprinkling...
                      </div>
                    ) : (
                      <>
                        <Sparkles className='h-4 w-4 mr-2' /> Sprinkle Tips
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className='text-center py-4'>
                <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4'>
                  <Sparkles className='h-8 w-8' />
                </div>
                <h4 className='text-lg font-medium text-green-600 mb-2'>
                  Tips Sprinkled Successfully!
                </h4>
                <p className='text-sm text-gray-600'>
                  You've made {sprinkleTipRecipients} viewers happy with your
                  generosity!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
