'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { clientLogger } from '@/lib/client-logger'
import { WebRTCAdaptor } from '@antmedia/webrtc_adaptor'
import { createStream, deleteStream } from '@/lib/api-stream'

interface StreamComponentProps {
  streamIdToUse: string
  initiateStream: boolean
  onStreamStatusUpdate?: (
    isActuallyStreaming: boolean,
    activeStreamId: string | null
  ) => void
}

const StreamComponent = ({
  streamIdToUse,
  initiateStream,
  onStreamStatusUpdate
}: StreamComponentProps) => {
  const [publishing, setPublishing] = useState(false)
  const [websocketConnected, setWebsocketConnected] = useState(false)
  const webRTCAdaptor = useRef<WebRTCAdaptor | null>(null)
  const publishingStream = useRef<string | null>(null)

  const onStreamStatusUpdateRef = useRef(onStreamStatusUpdate)
  useEffect(() => {
    onStreamStatusUpdateRef.current = onStreamStatusUpdate
  }, [onStreamStatusUpdate])

  const streamIdToUseRef = useRef(streamIdToUse)
  useEffect(() => {
    streamIdToUseRef.current = streamIdToUse
  }, [streamIdToUse])

  const handleCreateStreamInternal = async (id: string) => {
    const newStream = await createStream(id)
    if (newStream) {
      alert(
        `Stream created with ID: ${newStream.id} and StreamId: ${newStream.streamId}`
      )
    } else {
      alert('Failed to create stream.')
    }
  }

  const handleDeleteStreamInternal = async (id: string) => {
    if (!id) {
      clientLogger.warn('handleDeleteStreamInternal called with no id', {}, 'StreamComponent')
      return
    }
    const success = await deleteStream(id)
    if (success) {
      alert(`Stream with StreamId: ${id} deleted successfully.`)
    } else {
      alert(`Failed to delete stream with StreamId: ${id}.`)
    }
  }

  const internalHandlePublish = useCallback(() => {
    if (
      webRTCAdaptor.current &&
      websocketConnected &&
      streamIdToUseRef.current
    ) {
      clientLogger.debug('Attempting to publish stream', { streamId: streamIdToUseRef.current }, 'StreamComponent')
      webRTCAdaptor.current.publish(streamIdToUseRef.current)
      handleCreateStreamInternal(streamIdToUseRef.current)
    } else {
      console.warn(
        'Cannot publish: WebRTC Adaptor not ready, websocket not connected, or streamIdToUse not provided.'
      )
    }
  }, [websocketConnected])

  const internalHandleStopPublishing = useCallback(() => {
    if (webRTCAdaptor.current && publishingStream.current) {
      clientLogger.debug('Attempting to stop stream', { streamId: publishingStream.current }, 'StreamComponent')
      webRTCAdaptor.current.stop(publishingStream.current)
      handleDeleteStreamInternal(publishingStream.current)
    } else {
      clientLogger.warn('Cannot stop: WebRTC Adaptor not ready or no stream currently publishing.', {}, 'StreamComponent')
    }
  }, [])

  useEffect(() => {
    if (!webRTCAdaptor.current || !websocketConnected) {
      return
    }

    if (initiateStream && !publishing) {
      internalHandlePublish()
    } else if (!initiateStream && publishing) {
      internalHandleStopPublishing()
    }
  }, [
    initiateStream,
    publishing,
    websocketConnected,
    internalHandlePublish,
    internalHandleStopPublishing
  ])

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
          OfferToReceiveAudio: false,
          OfferToReceiveVideo: false
        },
        localVideoId: 'localVideo',
        callback: (info: string, obj: any) => {
          if (info === 'initialized') {
            setWebsocketConnected(true)
          } else if (info === 'publish_started') {
            setPublishing(true)
            const startedStreamId = obj?.streamId || streamIdToUseRef.current
            publishingStream.current = startedStreamId
            onStreamStatusUpdateRef.current?.(true, startedStreamId)
            clientLogger.info('Publish started', { streamId: startedStreamId }, 'StreamComponent')
          } else if (info === 'publish_finished') {
            setPublishing(false)
            const finishedStreamId = publishingStream.current
            publishingStream.current = null
            onStreamStatusUpdateRef.current?.(false, finishedStreamId)
            clientLogger.info('Publish finished', { streamId: finishedStreamId }, 'StreamComponent')
          }
        },
        callbackError: (error: any, message: any) => {
          clientLogger.error('WebRTC Adaptor error', { error: JSON.stringify(error) }, 'StreamComponent')
          clientLogger.error('WebRTC error message', { message }, 'StreamComponent')
          const erroredStreamId = publishingStream.current
          setPublishing(false)
          publishingStream.current = null
          onStreamStatusUpdateRef.current?.(false, erroredStreamId)
          if (error === 'publishTimeoutError') {
          }
        }
      })
    }

    return () => {
      if (webRTCAdaptor.current) {
        if (publishingStream.current) {
          webRTCAdaptor.current.stop(publishingStream.current)
          handleDeleteStreamInternal(publishingStream.current)
          publishingStream.current = null
        }
        clientLogger.debug('StreamComponent unmounting, attempting to stop WebRTC Adaptor activities.', {}, 'StreamComponent')
      }
    }
  }, [])

  return (
    <div className='w-full'>
      <video
        id='localVideo'
        controls
        autoPlay
        muted={true}
        playsInline={true}
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '60vh',
          border: '1px solid #ccc',
          backgroundColor: '#000'
        }}
      ></video>
      {websocketConnected ? (
        <p className='text-xs text-green-500 mt-1'>Websocket Connected</p>
      ) : (
        <p className='text-xs text-red-500 mt-1'>Websocket Disconnected</p>
      )}
      {publishing && (
        <p className='text-xs text-blue-500 mt-1'>
          Streaming Live (ID: {publishingStream.current || 'N/A'})
        </p>
      )}
    </div>
  )
}

export default StreamComponent
