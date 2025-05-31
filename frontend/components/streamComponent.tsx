'use client'

import React, { useState, useEffect, useRef } from 'react'
import { WebRTCAdaptor } from '@antmedia/webrtc_adaptor'
import { Button } from '@/components/ui/button'
import { createStream, deleteStream } from '@/lib/api-stream'

const StreamComponent = () => {
  const [publishing, setPublishing] = useState(false)
  const [websocketConnected, setWebsocketConnected] = useState(false)
  const [streamId, setStreamId] = useState('stream123')
  const webRTCAdaptor = useRef<WebRTCAdaptor | null>(null)
  const publishingStream = useRef<string | null>(null)

  const handleCreateStream = async () => {
    const newStream = await createStream(streamId)
    if (newStream) {
      alert(
        `Stream created with ID: ${newStream.id} and StreamId: ${newStream.streamId}`
      )
    } else {
      alert('Failed to create stream.')
    }
  }

  const handleDeleteStream = async () => {
    const success = await deleteStream(streamId)
    if (success) {
      alert(`Stream with StreamId: ${streamId} deleted successfully.`)
    } else {
      alert(`Failed to delete stream with StreamId: ${streamId}.`)
    }
  }

  const handlePublish = () => {
    setPublishing(true)
    publishingStream.current = streamId
    if (webRTCAdaptor.current) {
      webRTCAdaptor.current.publish(streamId)
      handleCreateStream()
    }
  }

  const handleStopPublishing = () => {
    setPublishing(false)
    if (webRTCAdaptor.current && publishingStream.current) {
      // Assuming stop can be used for publishing as well, or specific unpublish method if available
      webRTCAdaptor.current.stop(publishingStream.current)
      handleDeleteStream()
    }
  }

  const handleStreamIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStreamId(event.target.value)
  }

  useEffect(() => {
    if (webRTCAdaptor.current === undefined || webRTCAdaptor.current === null) {
      webRTCAdaptor.current = new WebRTCAdaptor({
        websocket_url: 'wss://ams-30774.antmedia.cloud:5443/LiveApp/websocket', // Replace with your WebSocket URL
        mediaConstraints: {
          video: true,
          audio: true
        },
        peerconnection_config: {
          iceServers: [{ urls: 'stun:stun1.l.google.com:19302' }]
        },
        sdp_constraints: {
          OfferToReceiveAudio: false, // Usually false for publishing
          OfferToReceiveVideo: false // Usually false for publishing
        },
        localVideoId: 'localVideo', // Changed from remoteVideoId
        callback: (info: any) => {
          if (info === 'initialized') {
            setWebsocketConnected(true)
          }
          if (info === 'publish_started') {
            setPublishing(true)
            console.log('publish started')
          } else if (info === 'publish_finished') {
            setPublishing(false)
            console.log('publish finished')
          }
        },
        callbackError: function (error: any, message: any) {
          console.error('error callback: ' + JSON.stringify(error))
          console.error('error message: ' + message)
          // Re-try mechanism can be implemented here
          if (error === 'publishTimeoutError') {
            // You can try to republish.
          }
          setPublishing(false)
        }
      })
    }
  }, [])

  return (
    <div className='container mx-auto text-center p-4'>
      <h1 className='text-3xl font-bold mb-8'>Stream Page</h1>

      <div className='mb-4'>
        <div className='flex justify-center'>
          <video
            id='localVideo' // Changed from remoteVideo
            controls
            autoPlay
            muted={true} // Local video is often muted to avoid feedback
            playsInline={true}
            style={{
              width: '40vw',
              height: '60vh',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          ></video>
        </div>
      </div>
      <div className='flex flex-col items-center'>
        <div className='mb-3 w-full max-w-md'>
          <input
            className='block w-full p-2 text-lg border border-gray-300 rounded-md'
            type='text'
            defaultValue={streamId}
            onChange={handleStreamIdChange}
          />
          <label
            className='block text-sm font-medium text-gray-700 mt-1'
            htmlFor='streamId'
          >
            Enter Stream Id
          </label>
        </div>
        <div className='flex justify-center'>
          {!publishing ? (
            <Button
              variant='default'
              disabled={!websocketConnected}
              onClick={handlePublish}
            >
              Start Streaming
            </Button>
          ) : (
            <Button variant='destructive' onClick={handleStopPublishing}>
              Stop Streaming
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default StreamComponent
