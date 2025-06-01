'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Sparkles } from 'lucide-react'

interface SprinkleTipsModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmitSprinkle: (totalAmount: string, recipients: number) => void
}

export function SprinkleTipsModal ({
  isOpen,
  onClose,
  onSubmitSprinkle
}: SprinkleTipsModalProps) {
  const [currentSprinkleTipAmount, setCurrentSprinkleTipAmount] = useState('5')
  const [sprinkleTipRecipients, setSprinkleTipRecipients] = useState(5)
  const [sprinkleInProgress, setSprinkleInProgress] = useState(false) // To be managed by parent or via prop
  const [sprinkleComplete, setSprinkleComplete] = useState(false) // To be managed by parent or via prop

  // In a real scenario, sprinkleInProgress and sprinkleComplete might be better managed by the parent
  // and passed as props if the submission involves async operations that affect parent state.
  // For now, keeping them local to illustrate modal states, but they would likely be lifted.

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!currentSprinkleTipAmount || Number(currentSprinkleTipAmount) <= 0)
      return
    // Typically, you'd set sprinkleInProgress = true here if it were local and an async call was made here.
    // For this refactor, onSubmitSprinkle will handle the logic including setting progress/completion.
    onSubmitSprinkle(currentSprinkleTipAmount, sprinkleTipRecipients)
    // Parent will handle closing the modal and resetting states like sprinkleComplete
  }

  // This is a simplified version. The parent (StreamerDashboard) will actually handle the full sprinkle logic,
  // including setting inProgress and complete states which would then be passed down to this modal if needed
  // to show loading/success messages within the modal itself.
  // For this extraction, we primarily focus on the form elements and triggering the submission.

  if (sprinkleComplete) {
    // This state would ideally be passed from parent after successful sprinkle
    return (
      <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-lg p-4 w-[90%] max-w-sm text-center py-8'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4'>
            <Sparkles className='h-8 w-8' />
          </div>
          <h4 className='text-lg font-medium text-green-600 mb-2'>
            Tips Sprinkled Successfully!
          </h4>
          <p className='text-sm text-gray-600 mb-4'>
            You've made {sprinkleTipRecipients} viewers happy!
          </p>
          <Button onClick={onClose} className='rounded-full'>
            Done
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-4 w-[90%] max-w-sm'>
        <h3 className='font-medium mb-2'>Sprinkle WLD to Verified Viewers</h3>
        <p className='text-sm text-gray-600 mb-4'>
          Randomly distribute tips to verified viewers in your stream. The total
          amount will be divided equally among recipients.
        </p>
        <div className='space-y-4'>
          <div>
            <div className='text-sm font-medium mb-2'>
              Total amount to distribute:
            </div>
            <div className='grid grid-cols-4 gap-2 mb-3'>
              {[5, 10, 20, 50].map(val => (
                <Button
                  key={val}
                  variant={
                    currentSprinkleTipAmount === val.toString()
                      ? 'default'
                      : 'outline'
                  }
                  size='sm'
                  onClick={() => setCurrentSprinkleTipAmount(val.toString())}
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
                currentSprinkleTipAmount &&
                ![5, 10, 20, 50].includes(Number(currentSprinkleTipAmount))
                  ? currentSprinkleTipAmount
                  : ''
              }
              onChange={e => setCurrentSprinkleTipAmount(e.target.value)}
              min='1'
              step='1'
              className='w-full rounded-full'
            />
          </div>
          <div>
            <div className='flex items-center justify-between mb-2'>
              <Label className='text-sm font-medium'>
                Number of recipients: {sprinkleTipRecipients}
              </Label>
            </div>
            <Slider
              defaultValue={[5]}
              min={1}
              max={15}
              step={1}
              onValueChange={value => setSprinkleTipRecipients(value[0])}
              className='mb-2'
            />
            <p className='text-xs text-gray-500'>
              Each viewer will receive $
              {currentSprinkleTipAmount && sprinkleTipRecipients
                ? (
                    Number(currentSprinkleTipAmount) / sprinkleTipRecipients
                  ).toFixed(2)
                : '0.00'}
            </p>
          </div>
          <div className='flex gap-2 justify-end'>
            <Button
              variant='outline'
              onClick={onClose}
              className='rounded-full'
              disabled={sprinkleInProgress}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !currentSprinkleTipAmount ||
                Number(currentSprinkleTipAmount) <= 0 ||
                sprinkleInProgress
              }
              className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full'
            >
              {sprinkleInProgress ? (
                <div className='flex items-center'>
                  <div className='animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full'></div>
                  Sprinkling...
                </div>
              ) : (
                <>
                  <Sparkles className='h-4 w-4 mr-2' /> Sprinkle WLD
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
