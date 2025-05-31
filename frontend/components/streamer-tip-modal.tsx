'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { DashboardMessage } from '@/app/types' // Assuming DashboardMessage is in types.ts

interface StreamerTipModalProps {
  isOpen: boolean
  selectedMessage: DashboardMessage | null
  onClose: () => void
  onSubmitTip: (amount: string) => void // Only amount is needed as selectedMessage is in parent state
}

export function StreamerTipModal ({
  isOpen,
  selectedMessage,
  onClose,
  onSubmitTip
}: StreamerTipModalProps) {
  const [streamerTipAmount, setStreamerTipAmount] = useState('')

  if (!isOpen || !selectedMessage) return null

  const handleSubmit = () => {
    if (!streamerTipAmount) return
    const amount = Number.parseFloat(streamerTipAmount)
    if (isNaN(amount) || amount <= 0) return

    onSubmitTip(streamerTipAmount)
    setStreamerTipAmount('') // Reset local state after submit
    // onClose will be called by the parent after submission logic
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-4 w-[90%] max-w-sm'>
        <h3 className='font-medium mb-2'>Tip {selectedMessage.username}</h3>
        <p className='text-sm text-gray-600 mb-4'>
          "{selectedMessage.message}"
        </p>
        <div className='space-y-4'>
          <div>
            <div className='text-sm font-medium mb-2'>Select tip amount:</div>
            <div className='grid grid-cols-4 gap-2 mb-3'>
              {[1, 2, 5, 10].map(val => (
                <Button
                  key={val}
                  variant={
                    streamerTipAmount === val.toString() ? 'default' : 'outline'
                  }
                  size='sm'
                  onClick={() => setStreamerTipAmount(val.toString())}
                  className='text-xs rounded-full'
                >
                  ${val}
                </Button>
              ))}
            </div>
            <Input
              type='number'
              placeholder='Custom amount ($)'
              value={
                streamerTipAmount &&
                ![1, 2, 5, 10].includes(Number(streamerTipAmount))
                  ? streamerTipAmount
                  : ''
              }
              onChange={e => setStreamerTipAmount(e.target.value)}
              min='0.50'
              step='0.50'
              className='w-full rounded-full'
            />
          </div>
          <div className='flex gap-2 justify-end'>
            <Button
              variant='outline'
              onClick={onClose}
              className='rounded-full'
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!streamerTipAmount || Number(streamerTipAmount) <= 0}
              className='bg-green-500 hover:bg-green-600 rounded-full'
            >
              Send Tip
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
