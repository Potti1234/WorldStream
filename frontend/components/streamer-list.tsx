'use client'

import { useState, useRef, useCallback } from 'react'
import type { Streamer } from '@/app/types'
import { StreamerListHeader } from './streamer-list-header'
import { StreamerCard } from './streamer-card'
import { RefreshCw } from 'lucide-react'

interface StreamerListProps {
  streamers: Streamer[]
  onSelectStreamer: (streamer: Streamer) => void
  onToggleAppMode: () => void
  onRefresh: () => Promise<void>
  isRefreshing?: boolean
  appMode: 'viewer' | 'streamer'
}

export function StreamerList ({
  streamers,
  onSelectStreamer,
  onToggleAppMode,
  onRefresh,
  isRefreshing = false,
  appMode
}: StreamerListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)

  const PULL_THRESHOLD = 80
  const MAX_PULL_DISTANCE = 120

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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling) return

    currentY.current = e.touches[0].clientY
    const distance = Math.min(currentY.current - startY.current, MAX_PULL_DISTANCE)
    
    if (distance > 0) {
      e.preventDefault()
      setPullDistance(distance)
    }
  }, [isPulling])

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return

    setIsPulling(false)
    
    if (pullDistance >= PULL_THRESHOLD) {
      await onRefresh()
    }
    
    setPullDistance(0)
  }, [isPulling, pullDistance, onRefresh])

  const getPullIndicatorOpacity = () => {
    return Math.min(pullDistance / PULL_THRESHOLD, 1)
  }

  const getPullIndicatorRotation = () => {
    return (pullDistance / PULL_THRESHOLD) * 360
  }

  return (
    <div className='max-w-md mx-auto bg-white min-h-screen'>
      <StreamerListHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        clearSearch={clearSearch}
        onToggleAppMode={onToggleAppMode}
        filteredStreamersCount={filteredStreamers.length}
        showSearchResultsCount={searchQuery.length > 0}
      />

      {/* Pull-to-refresh indicator */}
      <div 
        className='relative overflow-hidden'
        style={{
          transform: `translateY(${Math.min(pullDistance, MAX_PULL_DISTANCE)}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {/* Refresh indicator */}
        <div 
          className='absolute top-0 left-0 right-0 flex justify-center items-center bg-gray-50 border-b border-gray-100'
          style={{
            height: `${Math.min(pullDistance, MAX_PULL_DISTANCE)}px`,
            transform: `translateY(-${MAX_PULL_DISTANCE}px)`,
            opacity: getPullIndicatorOpacity()
          }}
        >
          <RefreshCw 
            className={`h-6 w-6 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              transform: isRefreshing ? 'none' : `rotate(${getPullIndicatorRotation()}deg)`,
              transition: 'transform 0.1s ease-out'
            }}
          />
          <span className='ml-2 text-gray-500 text-sm'>
            {isRefreshing ? 'Refreshing...' : pullDistance >= PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>

        {/* Streamer List */}
        <div 
          ref={containerRef}
          className='p-4 space-y-3 overflow-y-auto'
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            minHeight: 'calc(100vh - 140px)', // Adjust based on header height
            touchAction: isPulling ? 'none' : 'auto'
          }}
        >
          {filteredStreamers && filteredStreamers.length > 0 ? (
            filteredStreamers.map((streamer, index) => (
              <StreamerCard
                key={streamer.id || `streamer-${index}`}
                streamer={streamer}
                onSelectStreamer={onSelectStreamer}
              />
            ))
          ) : (
            <div className='text-center py-10'>
              <p className='text-gray-500'>
                {searchQuery ? `No streamers found matching "${searchQuery}"` : 'No streams available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
