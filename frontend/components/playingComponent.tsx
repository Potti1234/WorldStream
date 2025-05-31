'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { WebRTCAdaptor } from '@antmedia/webrtc_adaptor'

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
  const webRTCAdaptor = useRef<WebRTCAdaptor | null>(null)
  const currentPlayingStreamId = useRef<string | null>(null)

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
      console.log('Attempting to play stream:', streamIdToPlayRef.current)
      currentPlayingStreamId.current = streamIdToPlayRef.current
      webRTCAdaptor.current.play(
        streamIdToPlayRef.current,
        undefined,
        undefined,
        []
      )
    } else {
      console.warn(
        'Cannot play: WebRTC Adaptor not ready, websocket not connected, streamId not provided, or already playing.'
      )
    }
  }, [websocketConnected, isActuallyPlaying])

  const internalHandleStop = useCallback(() => {
    if (webRTCAdaptor.current && currentPlayingStreamId.current) {
      console.log('Attempting to stop stream:', currentPlayingStreamId.current)
      webRTCAdaptor.current.stop(currentPlayingStreamId.current)
    } else {
      console.warn(
        'Cannot stop: WebRTC Adaptor not ready or no stream ID to stop.'
      )
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
            console.log('Playback started for stream:', playedStreamId)
          } else if (info === 'play_finished') {
            setIsActuallyPlaying(false)
            const finishedStreamId = currentPlayingStreamId.current
            currentPlayingStreamId.current = null
            onPlaybackStatusUpdateRef.current?.(false, finishedStreamId)
            console.log('Playback finished for stream:', finishedStreamId)
          }
        },
        callbackError: (error: any, message: any) => {
          console.error('PlayingComponent Error:', error, 'Message:', message)
          const erroredStreamId = currentPlayingStreamId.current
          setIsActuallyPlaying(false)
          currentPlayingStreamId.current = null
          onPlaybackStatusUpdateRef.current?.(false, erroredStreamId)
          if (
            error === 'no_stream_exist' ||
            error.indexOf('NotFoundError') !== -1 ||
            error.indexOf('no_active_streams_found') !== -1
          ) {
            console.warn(
              `Stream ${erroredStreamId} does not exist or has ended.`
            )
          }
        }
      })
    }

    return () => {
      if (webRTCAdaptor.current) {
        if (currentPlayingStreamId.current) {
          console.log(
            'PlayingComponent unmounting, stopping stream:',
            currentPlayingStreamId.current
          )
          webRTCAdaptor.current.stop(currentPlayingStreamId.current)
        }
        console.log('PlayingComponent unmounted or videoElementId changed.')
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

  return (
    <div
      className='w-full bg-black flex justify-center items-center'
      style={{ minHeight: '30vh' }}
    >
      <video
        id={videoElementId}
        controls
        autoPlay
        muted={false}
        playsInline={true}
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '70vh',
          display: websocketConnected ? 'block' : 'none'
        }}
      >
        Your browser does not support the video tag.
      </video>
      {!websocketConnected && (
        <p className='text-white'>Connecting to stream...</p>
      )}
    </div>
  )
}

export default PlayingComponent
