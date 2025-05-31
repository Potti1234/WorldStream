'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Settings } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

interface DashboardHeaderProps {
  isLive: boolean
  onToggleAppMode: () => void
  onToggleLive: () => void
  onShowSettings: () => void
}

export function DashboardHeader ({
  isLive,
  onToggleAppMode,
  onToggleLive,
  onShowSettings
}: DashboardHeaderProps) {
  return (
    <div className='sticky top-0 bg-white border-b border-gray-200 p-4 z-10'>
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
          onClick={onShowSettings}
          className='rounded-full'
        >
          <Settings className='h-5 w-5' />
        </Button>
      </div>

      {/* Live Toggle */}
      <Button
        onClick={onToggleLive}
        variant={isLive ? 'destructive' : 'default'}
        className='w-full rounded-full'
        size='lg'
      >
        {isLive ? 'End Stream' : 'Go Live'}
      </Button>
    </div>
  )
}
