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
) => {
  pb.collection('message').subscribe('*', function (e) {
    console.log(e.action);
    console.log(e.record);
  });

};

export const unsubscribeFromMessages = async () => {
  pb.collection('message').unsubscribe();
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