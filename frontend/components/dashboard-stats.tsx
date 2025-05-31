'use client'

import { Users, DollarSign, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardStatsProps {
  viewerCount: number
  totalTips: number
  recentMessagesCount: number
  isLive: boolean
  onToggleLive: () => void
}

// Safe function to send haptic feedback only if MiniKit is available
const sendHapticFeedbackSafe = () => {
  if (typeof window === 'undefined') return

  try {
    const { MiniKit } = require('@worldcoin/minikit-js')
    if (MiniKit && typeof MiniKit.isInstalled === 'function' && MiniKit.isInstalled()) {
      MiniKit.commands.sendHapticFeedback({
        hapticsType: 'impact',
        style: 'medium',
      })
    }
  } catch (error) {
    // Silently ignore if MiniKit is not available
    console.debug('MiniKit haptic feedback not available:', error)
  }
}

export function DashboardStats ({
  viewerCount,
  totalTips,
  recentMessagesCount,
  isLive,
  onToggleLive
}: DashboardStatsProps) {
  const handleToggleClick = () => {
    onToggleLive()
    
    // Safely send haptic feedback if available
    sendHapticFeedbackSafe()
  }
  return (
    <div className='p-4 border-b border-gray-200'>
      <div className='grid grid-cols-3 gap-4 mb-4'>
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
      
      {/* End Stream Button */}
      <div className='flex justify-center'>
        <Button
          onClick={handleToggleClick}
          variant={isLive ? 'destructive' : 'default'}
          className='w-48 rounded-full'
          size='lg'
        >
          {isLive ? 'End Stream' : 'Go Live'}
        </Button>
      </div>
    </div>
  )
}
