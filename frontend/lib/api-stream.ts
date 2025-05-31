"use client"

import { clientLogger } from '@/lib/client-logger';
import pb from '@/lib/pocketbase';

export interface Stream {
  id?: string;
  streamId: string;
  // Add other stream properties here if needed
}

export const createStream = async (streamId: string): Promise<Stream | null> => {
  try {
    const data = { streamId };
    const record = await pb.collection('stream').create<Stream>(data);
    return record;
  } catch (error) {
    clientLogger.error('Failed to create stream', { error }, 'createStream');
    return null;
  }
};

export const deleteStream = async (streamId: string): Promise<boolean> => {
  try {
    // First, find the record by streamId to get its actual ID
    const records = await pb.collection('stream').getFullList<Stream>({
      filter: `streamId = "${streamId}"`,
    });

    if (records.length === 0) {
      clientLogger.warn('Stream not found', { streamId }, 'deleteStream');
      return false;
    }

    // Assuming streamId is unique, there should be at most one record
    const recordToDelete = records[0];
    if (!recordToDelete.id) {
        clientLogger.error('Record ID is undefined, cannot delete', {}, 'deleteStream');
        return false;
    }
    await pb.collection('stream').delete(recordToDelete.id);
    return true;
  } catch (error) {
    clientLogger.error('Failed to delete stream', { error }, 'deleteStream');
    return false;
  }
}; 

export const getAllStreams = async (): Promise<Stream[]> => {
  try {
    const records = await pb.collection('stream').getFullList<Stream>();
    return records;
  } catch (error) {
    clientLogger.error('Failed to get all streams', { error }, 'getAllStreams');
    return [];
  }
};

export const getStreamByTextId = async (textStreamId: string): Promise<Stream | null> => {
  try {
    const records = await pb.collection('stream').getFullList<Stream>({
      filter: `streamId = "${textStreamId}"`,
    });

    if (records.length === 0) {
      console.warn(`Stream with textStreamId "${textStreamId}" not found.`);
      return null;
    }
    // Assuming streamId is unique, return the first match
    return records[0];
  } catch (error) {
    console.error('Failed to get stream by textStreamId:', error);
    return null;
  }
};
