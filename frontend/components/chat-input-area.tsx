'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, Send, Heart } from 'lucide-react'

interface ChatInputAreaProps {
  onSendMessage: (message: string) => void
  onSendTip: (message: string, tipAmount: string) => void
  inputAreaRef: React.RefObject<HTMLDivElement | null>
  onHeightChange: (height: number) => void
}

export function ChatInputArea ({
  onSendMessage,
  onSendTip,
  inputAreaRef,
  onHeightChange
}: ChatInputAreaProps) {
  const [message, setMessage] = useState('')
  const [tipAmount, setTipAmount] = useState('')
  const [showTipInput, setShowTipInput] = useState(false)

  useEffect(() => {
    if (inputAreaRef.current) {
      const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
          onHeightChange(entry.contentRect.height)
        }
      })
      observer.observe(inputAreaRef.current)
      return () => {
        observer.disconnect()
      }
    }
  }, [inputAreaRef, onHeightChange, showTipInput])

  const handleInternalSendMessage = () => {
    if (!message.trim()) return
    onSendMessage(message.trim())
    setMessage('')
  }

  const handleInternalSendTip = () => {
    if (!tipAmount || !message.trim()) return
    onSendTip(message.trim(), tipAmount)
    setMessage('')
    setTipAmount('')
    setShowTipInput(false)
  }

  return (
    <div
      ref={inputAreaRef}
      className='fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 p-3 z-20'
    >
      {showTipInput && (
        <div className='space-y-3 mb-3'>
          <div className='text-sm font-medium'>Select tip amount:</div>
          <div className='grid grid-cols-4 gap-2'>
            {[1, 2, 5, 10].map(amount => (
              <Button
                key={amount}
                variant={
                  tipAmount === amount.toString() ? 'default' : 'outline'
                }
                size='sm'
                onClick={() => setTipAmount(amount.toString())}
                className='text-xs rounded-full'
              >
                ${amount}
              </Button>
            ))}
          </div>
          <div className='flex gap-2'>
            <Input
              placeholder='Custom amount'
              value={
                tipAmount && ![1, 2, 5, 10].includes(Number(tipAmount))
                  ? tipAmount
                  : ''
              }
              onChange={e => setTipAmount(e.target.value)}
              type='number'
              min='0.50'
              step='0.50'
              className='flex-1 rounded-full'
            />
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowTipInput(false)}
              className='rounded-full'
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className='flex gap-2'>
        <Input
          placeholder='Send a message...'
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyPress={e =>
            e.key === 'Enter' &&
            (showTipInput
              ? handleInternalSendTip()
              : handleInternalSendMessage())
          }
          className='flex-1 rounded-full'
        />
        {!showTipInput ? (
          <>
            <Button
              variant='outline'
              size='icon'
              onClick={() => setShowTipInput(true)}
              className='flex-shrink-0 rounded-full'
            >
              <DollarSign className='w-4 h-4' />
            </Button>
            <Button
              size='icon'
              onClick={handleInternalSendMessage}
              disabled={!message.trim()}
              className='flex-shrink-0 rounded-full'
            >
              <Send className='w-4 h-4' />
            </Button>
          </>
        ) : (
          <Button
            size='icon'
            onClick={handleInternalSendTip}
            disabled={!message.trim() || !tipAmount}
            className='flex-shrink-0 bg-green-500 hover:bg-green-600 rounded-full'
          >
            <Heart className='w-4 h-4' />
          </Button>
        )}
      </div>
    </div>
  )
}
