'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home () {
  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24'>
      <div className='flex space-x-4'>
        <Link href='/watch'>
          <Button variant='outline'>Watch Stream</Button>
        </Link>
        <Link href='/stream'>
          <Button variant='outline'>Start Stream</Button>
        </Link>
      </div>
    </main>
  )
}
