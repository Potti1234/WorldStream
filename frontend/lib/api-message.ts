"use client"

import { clientLogger } from '@/lib/client-logger';
import pb from '@/lib/pocketbase';
import { getStreamByTextId } from './api-stream';

export interface Message {
  id?: string;
  text: string;
  streamId: string; // Reference to the stream
  // Add other message properties here if needed, e.g., sender, timestamp
  created?: string; // PocketBase automatically adds created/updated timestamps
}

export const getAllMessagesForStream = async (streamId: string): Promise<Message[]> => {
  try {
    const records = await pb.collection('message').getFullList<Message>({
      filter: `stream = "${streamId}"`,
      sort: 'created', // Optional: sort messages by creation time
    });
    return records;
  } catch (error) {
    clientLogger.error('Failed to get messages for stream', { error }, 'api-message');
    return [];
  }
};

export const subscribeToMessages = async (
  streamId: string, 
  callback: (message: Message) => void
): Promise<() => void> => {
  console.log(`[Realtime] Attempting to subscribe to messages for stream DB ID: ${streamId}`);

  const handleNewMessage = (e: any) => {
    console.log('[Realtime] Event received:', JSON.parse(JSON.stringify(e))); // Log a copy
    console.log(`[Realtime] Event action: ${e.action}, Event record streamId: ${e.record?.streamId}, Target streamId: ${streamId}`);

    if (e.action === 'create' && e.record && e.record.streamId === streamId) {
      console.log('[Realtime] CREATE event for target stream MATCHED. Record:', JSON.parse(JSON.stringify(e.record)));
      const newMessage: Message = {
        id: e.record.id,
        text: e.record.text,
        streamId: e.record.streamId, 
        created: e.record.created,
      };
      callback(newMessage);
    } else if (e.action === 'create') {
      console.log('[Realtime] CREATE event received, but for a DIFFERENT stream or malformed. Record streamId:', e.record?.streamId, 'Target streamId:', streamId);
    }
  };

  try {
    // The subscribe method itself returns a Promise that resolves to the unsubscribe function.
    const unsubscribeFunc = await pb.collection('message').subscribe('*', handleNewMessage);
    console.log(`[Realtime] Successfully subscribed to message collection for stream DB ID: ${streamId}`);
    
    // Return the unsubscribe function provided by PocketBase SDK
    return () => {
      console.log(`[Realtime] Unsubscribing from messages for stream DB ID: ${streamId}`);
      try {
        unsubscribeFunc(); // Call the actual unsubscribe function from SDK
        console.log(`[Realtime] Successfully called unsubscribe for stream DB ID: ${streamId}`);
      } catch (error) {
        clientLogger.error('Error during unsubscribe for stream', { streamId, error }, 'api-message');
      }
    };
  } catch (error) {
    clientLogger.error('Failed to subscribe to messages for stream', { streamId, error }, 'api-message');
    // If subscription fails, return a no-op function for unsubscription
    return () => {
      console.warn(`[Realtime] Subscription had failed for stream DB ID: ${streamId}, unsubscription is a no-op.`);
    };
  }
};

export const createMessage = async (text: string, streamId: string): Promise<Message | null> => {
  try {
    // Ensure the field name matches your PocketBase collection schema for the stream relation
    const data = { text, stream: streamId }; 
    const record = await pb.collection('message').create<Message>(data);
    return record;
  } catch (error) {
    clientLogger.error('Failed to create message', { error, streamId }, 'api-message');
    return null;
  }
}; 