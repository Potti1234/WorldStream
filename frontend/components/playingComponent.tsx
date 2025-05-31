'use client'

import React, { useState, useEffect, useRef } from 'react'
import { WebRTCAdaptor } from '@antmedia/webrtc_adaptor'
import { Button } from '@/components/ui/button'

const PlayingComponent = () => {
  const [playing, setPlaying] = useState(false)
  const [websocketConnected, setWebsocketConnected] = useState(false)
  const [streamId, setStreamId] = useState('stream123')
  const webRTCAdaptor = useRef<WebRTCAdaptor | null>(null)
  const playingStream = useRef<string | null>(null)

  const handlePlay = () => {
    setPlaying(true)
    playingStream.current = streamId
    if (webRTCAdaptor.current) {
      webRTCAdaptor.current.play(streamId)
    }
  }

  const handleStopPlaying = () => {
    setPlaying(false)
    if (webRTCAdaptor.current && playingStream.current) {
      webRTCAdaptor.current.stop(playingStream.current)
    }
  }

  const handleStreamIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStreamId(event.target.value)
  }

  useEffect(() => {
    if (webRTCAdaptor.current === undefined || webRTCAdaptor.current === null) {
      webRTCAdaptor.current = new WebRTCAdaptor({
        websocket_url: 'wss://ams-30774.antmedia.cloud:5443/LiveApp/websocket',
        mediaConstraints: {
          video: true,
          audio: true
        },
        peerconnection_config: {
          iceServers: [{ urls: 'stun:stun1.l.google.com:19302' }]
        },
        sdp_constraints: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true // Set to true to receive video
        },
        remoteVideoId: 'remoteVideo',
        callback: (info: any) => {
          if (info === 'initialized') {
            setWebsocketConnected(true)
          }
        },
        callbackError: function (error: any, message: any) {
          console.log(error, message)
          if (error === 'no_stream_exist') {
            handleStopPlaying()
            setPlaying(false)
            alert(error)
          }
        }
      })
    }
  }, [])

  return (
    <div className='container mx-auto text-center p-4'>
      <h1 className='text-3xl font-bold mb-8'>Play Page</h1>

      <div className='mb-4'>
        <div className='flex justify-center'>
          <video
            id='remoteVideo'
            controls
            autoPlay
            muted={true}
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
          {!playing ? (
            <Button
              variant='default'
              disabled={!websocketConnected}
              onClick={handlePlay}
            >
              Start Playing
            </Button>
          ) : (
            <Button variant='destructive' onClick={handleStopPlaying}>
              Stop Playing
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlayingComponent
