'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Play } from 'lucide-react'
import type { Streamer } from '@/app/types'

interface StreamerCardProps {
  streamer: Streamer
  onSelectStreamer: (streamer: Streamer) => void
}

export function StreamerCard ({
  streamer,
  onSelectStreamer
}: StreamerCardProps) {
  const [imageError, setImageError] = useState(false)

  // Fallback placeholder - a simple gradient
  const placeholderDataUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8ZGVmcz4KPGR5bmFtaWNHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNjM2NmYxO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4YjVjZjY7c3RvcC1vcGFjaXR5OjEiIC8+CjwvZHluYW1pY0dyYWRpZW50Pgo8L2RlZnM+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiPkxpdmUgU3RyZWFtPC90ZXh0Pgo8L3N2Zz4K'

  return (
    <Card
      key={streamer.id}
      className='cursor-pointer hover:shadow-md transition-shadow active:scale-95 transition-transform'
      onClick={() => onSelectStreamer(streamer)}
    >
      <CardContent className='p-3'>
        <div className='flex gap-3'>
          {/* Thumbnail */}
          <div className='relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 to-blue-600'>
            {!imageError && streamer.thumbnail ? (
              <Image
                src={streamer.thumbnail}
                alt={streamer.title}
                fill
                className='object-cover'
                onError={() => setImageError(true)}
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center'>
                <Play className='w-6 h-6 text-white/80' />
              </div>
            )}
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
                  src={streamer.avatar}
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
