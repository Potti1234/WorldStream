'use client'

import { useRouter } from 'next/navigation'
import { StreamerDashboard } from '@/components/streamer-dashboard'

export default function StreamerPage () {
  const router = useRouter()

  const handleToggleAppMode = () => {
    router.push('/') // Navigate back to viewer mode (main page)
  }

  return (
    <StreamerDashboard
      onToggleAppMode={handleToggleAppMode}
      appMode='streamer' // Pass the current mode
    />
  )
}
