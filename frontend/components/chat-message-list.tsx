'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign } from 'lucide-react'
import type { ChatMessage } from '@/app/types'

interface ChatMessageListProps {
  messages: ChatMessage[]
  inputAreaHeight: number
  handleTipComment: (message: ChatMessage) => void
}

export function ChatMessageList ({
  messages,
  inputAreaHeight,
  handleTipComment
}: ChatMessageListProps) {
  return (
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
