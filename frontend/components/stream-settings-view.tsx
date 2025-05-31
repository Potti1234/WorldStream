'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Ban, Edit, Save } from 'lucide-react'

interface StreamSettingsViewProps {
  chatEnabled: boolean
  setChatEnabled: (enabled: boolean) => void
  tipsEnabled: boolean
  setTipsEnabled: (enabled: boolean) => void
  onClose: () => void
}

export function StreamSettingsView ({
  chatEnabled,
  setChatEnabled,
  tipsEnabled,
  setTipsEnabled,
  onClose
}: StreamSettingsViewProps) {
  return (
    <div className='max-w-md mx-auto bg-white min-h-screen'>
      <div className='sticky top-0 bg-white border-b border-gray-200 p-4 z-10 flex items-center justify-between'>
        <h1 className='text-xl font-bold'>Settings</h1>
        <Button variant='ghost' onClick={onClose} className='rounded-full'>
          Done
        </Button>
      </div>
      <div className='p-4 space-y-6'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>Chat Settings</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='chat-enabled'>Enable Chat</Label>
              <Switch
                id='chat-enabled'
                checked={chatEnabled}
                onCheckedChange={setChatEnabled}
              />
            </div>
            <div className='flex items-center justify-between'>
              <Label htmlFor='verified-only'>Verified Users Only</Label>
              <Switch id='verified-only' />
            </div>
            <div className='flex items-center justify-between'>
              <Label htmlFor='slow-mode'>Slow Mode</Label>
              <Switch id='slow-mode' />
            </div>
            <Button
              variant='destructive'
              size='sm'
              className='w-full rounded-full'
            >
              <Ban className='h-4 w-4 mr-2' />
              Clear Chat
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>Stream URL</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='space-y-2'>
              <Label htmlFor='stream-url'>External Stream URL</Label>
              <Input
                id='stream-url'
                placeholder='https://your-stream-url.com'
                className='rounded-full'
              />
              <p className='text-xs text-gray-500'>
                Link your streaming software.
              </p>
            </div>
            <Button size='sm' className='w-full rounded-full'>
              Save URL
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>Tip Settings</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='tips-enabled'>Enable Tips</Label>
              <Switch
                id='tips-enabled'
                checked={tipsEnabled}
                onCheckedChange={setTipsEnabled}
              />
            </div>
            <div className='flex items-center justify-between'>
              <Label htmlFor='tip-alerts'>Tip Alerts</Label>
              <Switch id='tip-alerts' defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
