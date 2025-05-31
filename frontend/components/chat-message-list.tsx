'use client'

import { useEffect, useState, useRef } from 'react'
import { clientLogger } from '@/lib/client-logger'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign } from 'lucide-react'
import type { ChatMessage } from '@/app/types'
import {
  getAllMessagesForStream,
  // subscribeToMessages, // No longer used for polling display
  // unsubscribeFromMessages, // No longer used for polling display
  Message as ApiMessage
} from '@/lib/api-message'

interface ChatMessageListProps {
  inputAreaHeight: number
  handleTipComment: (message: ChatMessage) => void
  streamId: string | undefined // Database ID of the stream
}

const mapApiMessageToChatMessage = (apiMsg: ApiMessage): ChatMessage => ({
  id: apiMsg.id || `mock-${Date.now()}-${Math.random()}`,
  username: `User${
    apiMsg.id ? apiMsg.id.slice(-2) : Math.floor(Math.random() * 100)
  }`,
  message: apiMsg.text,
  timestamp: apiMsg.created
    ? new Date(apiMsg.created).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  isTip: false,
  tipAmount: undefined,
  tipsReceived: [],
  streamerTip: undefined,
  isStreamerTip: false
})

export function ChatMessageList ({
  inputAreaHeight,
  handleTipComment,
  streamId
}: ChatMessageListProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true) // Ref to track if user is at the bottom

  // Effect to scroll to bottom ONLY if the user was already at the bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      ) as HTMLElement
      if (viewport) {
        if (isAtBottomRef.current) {
          viewport.scrollTop = viewport.scrollHeight
        }
      } else {
        // Fallback for non-Radix or if viewport not found
        if (isAtBottomRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
      }
    }
  }, [chatMessages])

  // Polling for messages
  useEffect(() => {
    if (!streamId) {
      setChatMessages([]) // Clear messages if no streamId
      return
    }

    const fetchMessages = async () => {
      console.log(`[Polling] Fetching messages for stream DB ID: ${streamId}`)
      const initialApiMessages = await getAllMessagesForStream(streamId)
      const mappedMessages = initialApiMessages.map(mapApiMessageToChatMessage)

      // Preserve scroll position logic
      const viewport = scrollAreaRef.current?.querySelector(
        '[data-radix-scroll-area-viewport]'
      ) as HTMLElement
      if (viewport) {
        const { scrollTop, scrollHeight, clientHeight } = viewport
        // Consider at bottom if within a small threshold
        isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 50
      } else {
        isAtBottomRef.current = true // Default to true if viewport not found
      }

      setChatMessages(mappedMessages)
    }

    fetchMessages() // Initial fetch
    const intervalId = setInterval(fetchMessages, 2000) // Poll every 2 seconds

    return () => {
      console.log(`[Polling] Clearing interval for stream DB ID: ${streamId}`)
      clearInterval(intervalId)
    }
  }, [streamId])

  // Removed the useEffect for subscribeToMessages/unsubscribeFromMessages as polling is now used for display

  return (
    <ScrollArea
      ref={scrollAreaRef}
      className='flex-1 p-3'
      style={{ paddingBottom: `${inputAreaHeight + 12}px` }}
      // Optionally, add onScroll to update isAtBottomRef if user scrolls manually
      onScroll={event => {
        const target = event.currentTarget as HTMLElement
        const viewport =
          (target.querySelector(
            '[data-radix-scroll-area-viewport]'
          ) as HTMLElement) || target
        const { scrollTop, scrollHeight, clientHeight } = viewport
        isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 50
      }}
    >
      <div className='space-y-3 pr-4'>
        {chatMessages.map(msg => (
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
                <span className='text-xs text-gray-400'>{msg.timestamp}</span>
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

              {msg.tipsReceived && msg.tipsReceived.length > 0 && (
                <div className='mt-2 space-y-1'>
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
  )
}
