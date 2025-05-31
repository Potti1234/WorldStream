'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Search, X, Video } from 'lucide-react'

interface StreamerListHeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  clearSearch: () => void
  onToggleAppMode: () => void
  filteredStreamersCount: number
  showSearchResultsCount: boolean
}

export function StreamerListHeader ({
  searchQuery,
  setSearchQuery,
  clearSearch,
  onToggleAppMode,
  filteredStreamersCount,
  showSearchResultsCount
}: StreamerListHeaderProps) {
  return (
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
      <p className='text-sm text-gray-500 mt-1'>Choose a streamer to support</p>

      {/* Search Bar */}
      <div className='mt-3 relative'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <Search className='h-4 w-4 text-gray-400' />
        </div>
        <Input
          type='text'
          placeholder='Search streamers, titles, categories...'
          className='pl-10 pr-10' // Added pr-10 for clear button spacing
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className='absolute inset-y-0 right-0 pr-3 flex items-center'
            onClick={clearSearch}
            aria-label='Clear search'
          >
            <X className='h-4 w-4 text-gray-400' />
          </button>
        )}
      </div>

      {/* Search Results Count */}
      {showSearchResultsCount && (
        <div className='mt-2 text-sm text-gray-500'>
          Found {filteredStreamersCount}{' '}
          {filteredStreamersCount === 1 ? 'result' : 'results'}
        </div>
      )}
    </div>
  )
}
