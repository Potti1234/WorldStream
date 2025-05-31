'use client'

import { Users, DollarSign, MessageSquare } from 'lucide-react'

interface DashboardStatsProps {
  viewerCount: number
  totalTips: number
  recentMessagesCount: number
}

export function DashboardStats ({
  viewerCount,
  totalTips,
  recentMessagesCount
}: DashboardStatsProps) {
  return (
    <div className='p-4 border-b border-gray-200'>
      <div className='grid grid-cols-3 gap-4'>
        <div className='text-center'>
          <div className='flex items-center justify-center mb-1'>
            <Users className='h-4 w-4 text-blue-500 mr-1' />
          </div>
          <div className='text-lg font-bold'>
            {viewerCount.toLocaleString()}
          </div>
          <div className='text-xs text-gray-500'>Viewers</div>
        </div>
        <div className='text-center'>
          <div className='flex items-center justify-center mb-1'>
            <DollarSign className='h-4 w-4 text-green-500 mr-1' />
          </div>
          <div className='text-lg font-bold'>${totalTips.toFixed(0)}</div>
          <div className='text-xs text-gray-500'>Tips</div>
        </div>
        <div className='text-center'>
          <div className='flex items-center justify-center mb-1'>
            <MessageSquare className='h-4 w-4 text-purple-500 mr-1' />
          </div>
          <div className='text-lg font-bold'>{recentMessagesCount}</div>
          <div className='text-xs text-gray-500'>Messages</div>
        </div>
      </div>
    </div>
  )
}
