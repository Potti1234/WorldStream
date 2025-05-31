'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Users } from 'lucide-react'
import type { Streamer } from '@/app/types'

interface StreamViewHeaderProps {
  streamer: Streamer
  onBack: () => void
}

export function StreamViewHeader ({ streamer, onBack }: StreamViewHeaderProps) {
  return (
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
  )
}
