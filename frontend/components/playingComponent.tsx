'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { clientLogger } from '@/lib/client-logger'
import { WebRTCAdaptor } from '@antmedia/webrtc_adaptor'
import { Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PlayingComponentProps {
  streamIdToPlay: string
  shouldBePlaying: boolean
  videoElementId: string
  onPlaybackStatusUpdate?: (
    isActuallyPlaying: boolean,
    activeStreamId: string | null
  ) => void
}

const PlayingComponent = ({
  streamIdToPlay,
  shouldBePlaying,
  videoElementId,
  onPlaybackStatusUpdate
}: PlayingComponentProps) => {
  const [isActuallyPlaying, setIsActuallyPlaying] = useState(false)
  const [websocketConnected, setWebsocketConnected] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const webRTCAdaptor = useRef<WebRTCAdaptor | null>(null)
  const currentPlayingStreamId = useRef<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const onPlaybackStatusUpdateRef = useRef(onPlaybackStatusUpdate)
  useEffect(() => {
    onPlaybackStatusUpdateRef.current = onPlaybackStatusUpdate
  }, [onPlaybackStatusUpdate])

  const streamIdToPlayRef = useRef(streamIdToPlay)
  useEffect(() => {
    streamIdToPlayRef.current = streamIdToPlay
  }, [streamIdToPlay])

  const videoElementIdRef = useRef(videoElementId)
  useEffect(() => {
    videoElementIdRef.current = videoElementId
  }, [videoElementId])

  const internalHandlePlay = useCallback(() => {
    if (
      webRTCAdaptor.current &&
      websocketConnected &&
      streamIdToPlayRef.current &&
      !isActuallyPlaying
    ) {
      clientLogger.debug('Attempting to play stream', { streamId: streamIdToPlayRef.current }, 'PlayingComponent')
      currentPlayingStreamId.current = streamIdToPlayRef.current
      webRTCAdaptor.current.play(
        streamIdToPlayRef.current,
        undefined,
        undefined,
        []
      )
    } else {
      clientLogger.warn('Cannot play stream', { 
        reason: 'WebRTC Adaptor not ready, websocket not connected, no stream ID, or already playing',
        isReady: !!webRTCAdaptor.current,
        isConnected: websocketConnected,
        hasStreamId: !!streamIdToPlayRef.current,
        isPlaying: isActuallyPlaying
      }, 'PlayingComponent')
    }
  }, [websocketConnected, isActuallyPlaying])

  const internalHandleStop = useCallback(() => {
    if (webRTCAdaptor.current && currentPlayingStreamId.current) {
      clientLogger.debug('Attempting to stop stream', { streamId: currentPlayingStreamId.current }, 'PlayingComponent')
      webRTCAdaptor.current.stop(currentPlayingStreamId.current)
    } else {
      clientLogger.warn('No active stream to stop or already stopped', {}, 'PlayingComponent')
    }
  }, [])

  useEffect(() => {
    if (!webRTCAdaptor.current || !websocketConnected) {
      return
    }

    if (shouldBePlaying && streamIdToPlayRef.current && !isActuallyPlaying) {
      internalHandlePlay()
    } else if (
      (!shouldBePlaying || !streamIdToPlayRef.current) &&
      isActuallyPlaying
    ) {
      internalHandleStop()
    }
  }, [
    shouldBePlaying,
    isActuallyPlaying,
    websocketConnected,
    internalHandlePlay,
    internalHandleStop
  ])

  useEffect(() => {
    if (!webRTCAdaptor.current) {
      webRTCAdaptor.current = new WebRTCAdaptor({
        websocket_url: 'wss://ams-30774.antmedia.cloud:5443/LiveApp/websocket',
        mediaConstraints: {
          video: false,
          audio: false
        },
        peerconnection_config: {
          iceServers: [{ urls: 'stun:stun1.l.google.com:19302' }]
        },
        sdp_constraints: {
          OfferToReceiveAudio: true,
          OfferToReceiveVideo: true
        },
        remoteVideoId: videoElementIdRef.current,
        callback: (info: string, obj: any) => {
          if (info === 'initialized') {
            setWebsocketConnected(true)
          } else if (info === 'play_started') {
            setIsActuallyPlaying(true)
            const playedStreamId =
              obj?.streamId || currentPlayingStreamId.current
            currentPlayingStreamId.current = playedStreamId
            onPlaybackStatusUpdateRef.current?.(true, playedStreamId)
            clientLogger.info('Playback started', { streamId: playedStreamId }, 'PlayingComponent')
          } else if (info === 'play_finished') {
            setIsActuallyPlaying(false)
            const finishedStreamId = currentPlayingStreamId.current
            currentPlayingStreamId.current = null
            onPlaybackStatusUpdateRef.current?.(false, finishedStreamId)
            clientLogger.info('Playback finished', { streamId: finishedStreamId }, 'PlayingComponent')
          }
        },
        callbackError: (error: any, message: any) => {
          clientLogger.error('Playback error', { 
            error: error ? JSON.stringify(error) : 'No error object',
            message: message || 'No message'
          }, 'PlayingComponent')
          const erroredStreamId = currentPlayingStreamId.current
          setIsActuallyPlaying(false)
          currentPlayingStreamId.current = null
          onPlaybackStatusUpdateRef.current?.(false, erroredStreamId)
          if (
            error === 'no_stream_exist' ||
            error.indexOf('NotFoundError') !== -1 ||
            error.indexOf('no_active_streams_found') !== -1
          ) {
            clientLogger.warn('Stream not found on server', { 
              streamId: streamIdToPlayRef.current 
            }, 'PlayingComponent')
          }
        }
      })
    }

    return () => {
      if (webRTCAdaptor.current) {
        if (currentPlayingStreamId.current) {
          clientLogger.debug('Playback status updated', { 
            isActuallyPlaying, 
            activeStreamId: currentPlayingStreamId.current 
          }, 'PlayingComponent')  
          webRTCAdaptor.current.stop(currentPlayingStreamId.current)
        }
        clientLogger.debug('PlayingComponent unmounted or videoElementId changed.', {}, 'PlayingComponent')
      }
    }
  }, [])

  useEffect(() => {
    if (
      webRTCAdaptor.current &&
      videoElementIdRef.current !==
        (webRTCAdaptor.current as any).remoteVideo?.id
    ) {
      console.warn(
        'Video element ID changed. This might require re-initialization or specific handling not yet implemented.'
      )
    }
  }, [videoElementId])

  const toggleFullscreen = useCallback(() => {
    if (!videoRef.current) return

    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <div
      className='w-full bg-black flex justify-center items-center relative'
      style={{ minHeight: '30vh' }}
    >
      <video
        ref={videoRef}
        id={videoElementId}
        autoPlay
        muted={false}
        playsInline={true}
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '70vh'
        }}
      >
        Your browser does not support the video tag.
      </video>
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? (
          <Minimize2 className="h-5 w-5" />
        ) : (
          <Maximize2 className="h-5 w-5" />
        )}
      </Button>
    </div>
  )
}

export default PlayingComponent
