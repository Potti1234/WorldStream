'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, Trash2, Ban } from 'lucide-react'
import { DashboardMessage } from '@/app/types'

interface ChatActivityMonitorProps {
  chatEnabled: boolean
  recentMessages: DashboardMessage[]
  onDeleteMessage: (id: string) => void
  onBanUser: (username: string) => void
  onTipComment: (message: DashboardMessage) => void
}

export function ChatActivityMonitor ({
  chatEnabled,
  recentMessages,
  onDeleteMessage,
  onBanUser,
  onTipComment
}: ChatActivityMonitorProps) {
  return (
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
                      onClick={() => onTipComment(msg)}
                    >
                      <DollarSign className='h-4 w-4' />
                    </Button>
                  )}
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-9 w-9 p-0 text-gray-400 hover:text-red-500 rounded-full'
                    onClick={() => onDeleteMessage(msg.id)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-9 w-9 p-0 text-gray-400 hover:text-red-500 rounded-full'
                    onClick={() => onBanUser(msg.username)}
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
  )
}
