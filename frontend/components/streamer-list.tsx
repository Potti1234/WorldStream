'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Search, X, Video } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import type { Streamer } from '@/app/page'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

interface StreamerListProps {
  streamers: Streamer[]
  onSelectStreamer: (streamer: Streamer) => void
  onToggleAppMode: () => void
  appMode: 'viewer' | 'streamer'
}

export function StreamerList ({
  streamers,
  onSelectStreamer,
  onToggleAppMode,
  appMode
}: StreamerListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredStreamers = streamers.filter(streamer => {
    const query = searchQuery.toLowerCase()
    return (
      streamer.name.toLowerCase().includes(query) ||
      streamer.title.toLowerCase().includes(query) ||
      streamer.category.toLowerCase().includes(query)
    )
  })

  const clearSearch = () => {
    setSearchQuery('')
  }

  return (
    <div className='max-w-md mx-auto bg-white min-h-screen'>
      {/* Header */}
      <div className='sticky top-0 bg-white border-b border-gray-200 p-4 z-10'>
        <div className='flex justify-between items-center mb-2'>
          <h1 className='text-xl font-bold'>Live Streams</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onToggleAppMode}
                  variant='outline'
                  size='icon'
                  className='rounded-full bg-red-50 border-red-200 hover:bg-red-100'
                  aria-label='Switch to Streamer Mode'
                >
                  <Video className='h-5 w-5 text-red-500' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Switch to Streamer Mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className='text-sm text-gray-500 mt-1'>
          Choose a streamer to support
        </p>

        {/* Search Bar */}
        <div className='mt-3 relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <Search className='h-4 w-4 text-gray-400' />
          </div>
          <Input
            type='text'
            placeholder='Search streamers, titles, categories...'
            className='pl-10 pr-10'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className='absolute inset-y-0 right-0 pr-3 flex items-center'
              onClick={clearSearch}
            >
              <X className='h-4 w-4 text-gray-400' />
            </button>
          )}
        </div>

        {/* Search Results Count */}
        {searchQuery && (
          <div className='mt-2 text-sm text-gray-500'>
            Found {filteredStreamers.length}{' '}
            {filteredStreamers.length === 1 ? 'result' : 'results'}
          </div>
        )}
      </div>

      {/* Streamer List */}
      <div className='p-4 space-y-3'>
        {filteredStreamers.length > 0 ? (
          filteredStreamers.map(streamer => (
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
                        <Badge
                          variant='destructive'
                          className='text-xs px-1.5 py-0.5'
                        >
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
                        <p className='font-medium text-sm truncate'>
                          {streamer.name}
                        </p>
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
          ))
        ) : (
          <div className='text-center py-10'>
            <p className='text-gray-500'>
              No streamers found matching "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
