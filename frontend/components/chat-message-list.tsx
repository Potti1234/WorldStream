'use client'

import { useEffect, useState, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign } from 'lucide-react'
import type { ChatMessage } from '@/app/types'
import {
  getAllMessagesForStream,
  subscribeToMessages,
  createMessage, // Added for completeness, though not directly used for sending here
  Message as ApiMessage
} from '@/lib/api-message' // Assuming api-message.ts is in lib

interface ChatMessageListProps {
  // messages: ChatMessage[] // Will be managed internally now
  inputAreaHeight: number
  handleTipComment: (message: ChatMessage) => void
  streamId: string | undefined // Changed to allow undefined, as it comes from currentApiStream?.id
}

// Helper function to map API message to ChatMessage
const mapApiMessageToChatMessage = (apiMsg: ApiMessage): ChatMessage => ({
  id: apiMsg.id || `mock-${Date.now()}-${Math.random()}`, // Ensure ID is a string and unique
  username: `User${
    apiMsg.id ? apiMsg.id.slice(-2) : Math.floor(Math.random() * 100)
  }`, // Mock username
  message: apiMsg.text,
  timestamp: apiMsg.created
    ? new Date(apiMsg.created).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), // Mock timestamp
  isTip: false, // Mock data
  tipAmount: undefined, // Mock data
  tipsReceived: [], // Mock data
  streamerTip: undefined, // Mock data
  isStreamerTip: false // Mock data
})

export function ChatMessageList ({
  inputAreaHeight,
  handleTipComment,
  streamId
}: ChatMessageListProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null) // Ref for ScrollArea's viewport

  // Effect to scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      // The actual scrollable element might be a child of the ScrollArea component.
      // We might need to find it. For Radix UI's ScrollArea, it's usually the first child.
      const viewport = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      } else {
        // Fallback if the specific selector isn't found
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
      }
    }
  }, [chatMessages])

  // Fetch initial messages
  useEffect(() => {
    if (!streamId) return

    const fetchMessages = async () => {
      const initialApiMessages = await getAllMessagesForStream(streamId)
      const mappedMessages = initialApiMessages.map(mapApiMessageToChatMessage)
      setChatMessages(mappedMessages)
    }

    fetchMessages()
  }, [streamId])

  // Subscribe to new messages - UPDATED FOR ASYNC SUBSCRIBE
  useEffect(() => {
    if (!streamId) return

    let unsubscribe: (() => void) | null = null

    const setupSubscription = async () => {
      try {
        unsubscribe = await subscribeToMessages(streamId, newApiMessage => {
          setChatMessages(prevMessages => [
            ...prevMessages,
            mapApiMessageToChatMessage(newApiMessage)
          ])
        })
      } catch (error) {
        console.error(
          'Error setting up message subscription in ChatMessageList:',
          error
        )
      }
    }

    setupSubscription()

    // Return cleanup function
    return () => {
      if (unsubscribe) {
        console.log(
          '[ChatMessageList] Cleaning up subscription for streamId:',
          streamId
        )
        unsubscribe()
      } else {
        console.log(
          '[ChatMessageList] No unsubscribe function available on cleanup for streamId:',
          streamId
        )
      }
    }
  }, [streamId])

  return (
    <ScrollArea
      ref={scrollAreaRef} // Assign ref here
      className='flex-1 p-3'
      style={{ paddingBottom: `${inputAreaHeight + 12}px` }}
    >
      <div className='space-y-3 pr-4'>
        {chatMessages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-2 text-sm ${
              msg.tipsReceived && msg.tipsReceived.length > 0
                ? msg.username === 'You' // This logic might need adjustment as "You" is mocked
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
            {/* This logic might need adjustment as "You" and "System" are mocked */}
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
