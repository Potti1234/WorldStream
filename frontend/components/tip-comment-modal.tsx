'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ChatMessage } from '@/app/types'
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider'

interface TipCommentModalProps {
  isOpen: boolean
  selectedMessage: ChatMessage | null
  onClose: () => void
  onSubmitTip: (messageId: string, amount: string) => void
}

// Safe function to send haptic feedback only if MiniKit is available
const sendHapticFeedbackSafe = (isInstalled: boolean) => {
  if (typeof window === 'undefined') return

  try {
    const { MiniKit } = require('@worldcoin/minikit-js')
    if (isInstalled) {
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

export function TipCommentModal ({
  isOpen,
  selectedMessage,
  onClose,
  onSubmitTip
}: TipCommentModalProps) {
  const [commentTipAmount, setCommentTipAmount] = useState('')
  const { isInstalled } = useMiniKit()

  if (!isOpen || !selectedMessage) return null

  const handleSubmit = () => {
    if (!commentTipAmount) return
    const amount = Number.parseFloat(commentTipAmount)
    if (isNaN(amount) || amount <= 0) return

    // Safely send haptic feedback if available
    sendHapticFeedbackSafe(isInstalled)

    onSubmitTip(selectedMessage.id, commentTipAmount)
    setCommentTipAmount('')
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
              {[1, 2, 5, 10].map(amount => (
                <Button
                  key={amount}
                  variant={
                    commentTipAmount === amount.toString()
                      ? 'default'
                      : 'outline'
                  }
                  size='sm'
                  onClick={() => setCommentTipAmount(amount.toString())}
                  className='text-xs rounded-full'
                >
                  ${amount}
                </Button>
              ))}
            </div>
            <Input
              type='number'
              placeholder='Custom amount ($)'
              value={
                commentTipAmount &&
                ![1, 2, 5, 10].includes(Number(commentTipAmount))
                  ? commentTipAmount
                  : ''
              }
              onChange={e => setCommentTipAmount(e.target.value)}
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
              disabled={!commentTipAmount || Number(commentTipAmount) <= 0}
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
