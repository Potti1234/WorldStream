'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { Heart, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { MiniKit, Tokens, tokenToDecimals } from '@worldcoin/minikit-js'

interface DonationButtonProps {
  streamerName: string
}

export function DonationButton ({ streamerName }: DonationButtonProps) {
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [buttonState, setButtonState] = useState<
    'pending' | 'success' | 'failed' | undefined
  >(undefined)

  const handleDonate = async () => {
    if (!amount || Number.parseFloat(amount) <= 0 || buttonState === 'pending')
      return

    setButtonState('pending')
    toast.info('Processing your donation...')

    try {
      // 1. Get streamer's wallet address
      const user = await MiniKit.getUserByUsername(streamerName)
      if (!user || !user.walletAddress) {
        toast.error(`Could not find wallet address for ${streamerName}.`)
        setButtonState('failed')
        setTimeout(() => setButtonState(undefined), 3000)
        return
      }
      const toAddress = user.walletAddress

      // 2. Initiate payment to get a reference ID
      const res = await fetch('/api/initiate-payment', {
        method: 'POST'
      })
      if (!res.ok) {
        throw new Error('Failed to initiate payment.')
      }
      const { id: referenceId } = await res.json()

      // 3. Execute payment
      const numericAmount = Number.parseFloat(amount)
      const result = await MiniKit.commandsAsync.pay({
        reference: referenceId,
        to: toAddress,
        tokens: [
          {
            symbol: Tokens.WLD,
            token_amount: tokenToDecimals(numericAmount, Tokens.WLD).toString()
          }
        ],
        description: message || `Donation to ${streamerName}`
      })

      // 4. Handle result
      if (result.finalPayload.status === 'success') {
        setButtonState('success')
        toast.success(
          `Thank you for donating ${numericAmount} WLD to ${streamerName}!`
        )
        setAmount('')
        setMessage('')
        setIsOpen(false)
        setTimeout(() => setButtonState(undefined), 3000)
      } else {
        throw new Error(
          `Payment failed with status: ${result.finalPayload.status}`
        )
      }
    } catch (error: any) {
      console.error('Donation error:', error)
      setButtonState('failed')
      toast.error(
        `Donation failed: ${error.message || 'An unexpected error occurred.'}`
      )
      setTimeout(() => setButtonState(undefined), 3000)
    }
  }

  const quickAmounts = ['0.1', '0.5', '1', '5']

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='text-red-500 border-red-500 hover:bg-red-50'
        >
          <Heart className='w-4 h-4 mr-1' />
          Donate
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className='mx-auto w-full max-w-sm'>
          <DrawerHeader>
            <DrawerTitle>Support {streamerName}</DrawerTitle>
            <DrawerDescription>
              Make a donation to support your favorite streamer.
            </DrawerDescription>
          </DrawerHeader>

          <div className='p-4 pb-0 space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Donation Amount
              </label>
              <div className='relative'>
                <DollarSign className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <Input
                  type='number'
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder='0.00'
                  className='pl-10'
                  min='0.01'
                  step='0.01'
                />
              </div>
            </div>

            <div className='grid grid-cols-4 gap-2'>
              {quickAmounts.map(quickAmount => (
                <Button
                  key={quickAmount}
                  variant='outline'
                  size='sm'
                  onClick={() => setAmount(quickAmount)}
                  className='text-xs'
                >
                  {quickAmount} WLD
                </Button>
              ))}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Message (Optional)
              </label>
              <Input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder='Say something nice...'
                maxLength={100}
              />
            </div>

            <Button
              onClick={handleDonate}
              className='w-full bg-red-500 hover:bg-red-600'
              disabled={
                !amount ||
                Number.parseFloat(amount) <= 0 ||
                buttonState === 'pending'
              }
            >
              {buttonState === 'pending' ? (
                'Processing...'
              ) : (
                <>
                  <Heart className='w-4 h-4 mr-2' />
                  Donate{' '}
                  {amount
                    ? `${Number.parseFloat(amount).toFixed(2)} WLD`
                    : '$0.00'}
                </>
              )}
            </Button>
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant='outline'>Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
