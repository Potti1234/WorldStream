'use client'

import { useState } from 'react'
import type { Streamer } from '@/app/types'
import { StreamerListHeader } from './streamer-list-header'
import { StreamerCard } from './streamer-card'

interface StreamerListProps {
  streamers: Streamer[]
  onSelectStreamer: (streamer: Streamer) => void
  onToggleAppMode: () => void
  appMode: 'viewer' | 'streamer' // appMode is passed to StreamerListHeader if needed, but not directly used in StreamerList itself for rendering logic other than passing it down.
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
      <StreamerListHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        clearSearch={clearSearch}
        onToggleAppMode={onToggleAppMode} // Pass down appMode if StreamerListHeader uses it for its own logic, e.g. different button text based on mode.
        filteredStreamersCount={filteredStreamers.length}
        showSearchResultsCount={searchQuery.length > 0} // Only show count if there's a search query
      />

      {/* Streamer List */}
      <div className='p-4 space-y-3'>
        {filteredStreamers.length > 0 ? (
          filteredStreamers.map(streamer => (
            <StreamerCard
              key={streamer.id}
              streamer={streamer}
              onSelectStreamer={onSelectStreamer}
            />
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
