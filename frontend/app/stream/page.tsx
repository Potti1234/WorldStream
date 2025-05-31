'use client'

import dynamic from 'next/dynamic'

const StreamComponent = dynamic(() => import('@/components/streamComponent'), {
  ssr: false
})

export default function StreamPage () {
  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <StreamComponent />
    </main>
  )
}
