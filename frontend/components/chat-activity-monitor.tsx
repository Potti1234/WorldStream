'use client'

import { useState, useEffect } from 'react'
import { clientLogger } from '@/lib/client-logger'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, Trash2, Ban, MoreVertical } from 'lucide-react'
import { DashboardMessage } from '@/app/types'
import {
  getAllMessagesForStream,
  Message as ApiMessage
} from '@/lib/api-message'

interface ChatActivityMonitorProps {
  chatEnabled: boolean
  onDeleteMessage: (id: string) => void
  onBanUser: (username: string) => void
  onTipComment: (message: DashboardMessage) => void
  streamId: string | undefined
}

// Helper to map API Message to DashboardMessage
const mapApiMessageToDashboardMessage = (
  apiMsg: ApiMessage
): DashboardMessage => ({
  id: apiMsg.id || `mock-dash-${Date.now()}-${Math.random()}`,
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
  streamerTip: undefined, // Mock data
  isStreamerTip: false // Mock data
})

export function ChatActivityMonitor ({
  chatEnabled,
  onDeleteMessage,
  onBanUser,
  onTipComment,
  streamId
}: ChatActivityMonitorProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [dashboardMessages, setDashboardMessages] = useState<DashboardMessage[]>([])

  // Polling for messages
  useEffect(() => {
    if (!streamId || !chatEnabled) {
      // Stop polling if chat is disabled
      setDashboardMessages([]) // Clear messages
      return
    }

    const fetchMessages = async () => {
      try {
        console.log(`[Polling CAM] Fetching messages for stream DB ID: ${streamId}`)
        const initialApiMessages = await getAllMessagesForStream(streamId)
        const mappedMessages = initialApiMessages.map(mapApiMessageToDashboardMessage)
        
        // Sort by timestamp descending for activity monitor (newest first)
        mappedMessages.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        
        // Update messages only if there are changes
        setDashboardMessages(prev => {
          const prevIds = new Set(prev.map(msg => msg.id))
          const newMessages = mappedMessages.filter(msg => !prevIds.has(msg.id))
          if (newMessages.length > 0) {
            return [...newMessages, ...prev].slice(0, 50) // Keep last 50 messages
          }
          return prev
        })
      } catch (error) {
        clientLogger.error('Failed to fetch messages', { error, streamId }, 'ChatActivityMonitor')
      }
    }

    fetchMessages() // Initial fetch
    const intervalId = setInterval(fetchMessages, 2000) // Poll every 2 seconds

    return () => {
      console.log(`[Polling CAM] Clearing interval for stream DB ID: ${streamId}`)
      clearInterval(intervalId)
    }
  }, [streamId, chatEnabled])

  const toggleMenu = (messageId: string) => {
    setOpenMenuId(openMenuId === messageId ? null : messageId)
  }

  const handleDeleteMessage = (id: string) => {
    onDeleteMessage(id)
    setDashboardMessages(prev => prev.filter(msg => msg.id !== id))
    setOpenMenuId(null)
  }

  const handleBanUser = (username: string) => {
    onBanUser(username)
    setDashboardMessages(prev => prev.filter(msg => msg.username !== username))
    setOpenMenuId(null)
  }

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
        <div className='p-4 pb-16'>
          {dashboardMessages.map(msg => (
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

                  {msg.username !== 'System' && (
                    <div className='relative'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-9 w-9 p-0 text-gray-400 hover:text-gray-600 rounded-full'
                        onClick={() => toggleMenu(msg.id)}
                      >
                        <MoreVertical className='h-4 w-4' />
                      </Button>

                      {openMenuId === msg.id && (
                        <div className='absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[120px]'>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className='flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 first:rounded-t-md'
                          >
                            <Trash2 className='h-4 w-4 mr-2' />
                            Delete Message
                          </button>
                          <button
                            onClick={() => handleBanUser(msg.username)}
                            className='flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-md'
                          >
                            <Ban className='h-4 w-4 mr-2' />
                            Ban User
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
