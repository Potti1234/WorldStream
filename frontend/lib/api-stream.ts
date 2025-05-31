"use client"

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
    console.error('Failed to create stream:', error);
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
      console.warn(`Stream with streamId "${streamId}" not found.`);
      return false;
    }

    // Assuming streamId is unique, there should be at most one record
    const recordToDelete = records[0];
    if (!recordToDelete.id) {
        console.error('Record ID is undefined, cannot delete.');
        return false;
    }
    await pb.collection('stream').delete(recordToDelete.id);
    return true;
  } catch (error) {
    console.error('Failed to delete stream:', error);
    return false;
  }
}; 