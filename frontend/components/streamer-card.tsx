'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users } from 'lucide-react'
import type { Streamer } from '@/app/types'

interface StreamerCardProps {
  streamer: Streamer
  onSelectStreamer: (streamer: Streamer) => void
}

export function StreamerCard ({
  streamer,
  onSelectStreamer
}: StreamerCardProps) {
  return (
    <Card
      key={streamer.id}
      className='cursor-pointer hover:shadow-md transition-shadow active:scale-95 transition-transform'
      onClick={() => onSelectStreamer(streamer)}
    >
      <CardContent className='p-3'>
        <div className='flex gap-3'>
          {/* Thumbnail */}
          <div className='relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0'>
            <Image
              src={streamer.thumbnail || '/placeholder.svg'}
              alt={streamer.title}
              fill
              className='object-cover'
            />
            {streamer.isLive && (
              <div className='absolute top-1 left-1'>
                <Badge variant='destructive' className='text-xs px-1.5 py-0.5'>
                  LIVE
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-start gap-2 mb-1'>
              <Avatar className='w-6 h-6 flex-shrink-0'>
                <AvatarImage
                  src={streamer.avatar || '/placeholder.svg'}
                  alt={streamer.name}
                />
                <AvatarFallback className='text-xs'>
                  {streamer.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1'>
                <p className='font-medium text-sm truncate'>{streamer.name}</p>
                <p className='text-xs text-gray-600 line-clamp-2 leading-tight'>
                  {streamer.title}
                </p>
              </div>
            </div>

            <div className='flex items-center justify-between mt-2'>
              <Badge variant='secondary' className='text-xs'>
                {streamer.category}
              </Badge>
              <div className='flex items-center gap-1 text-xs text-gray-500'>
                <Users className='w-3 h-3' />
                <span>{streamer.viewers.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
