import client from './client';
import type { Subscription } from '../types/user';

export async function getStatus(): Promise<Subscription | null> {
  const { data } = await client.get('/subscription/status');
  return data.data;
}

export async function verifyReceipt(receiptData: string): Promise<Subscription> {
  const { data } = await client.post('/subscription/verify', { receipt_data: receiptData });
  return data.data;
}

export async function getPurchasedSongs(): Promise<number[]> {
  const { data } = await client.get('/purchases/songs');
  return data.data;
}

export async function purchaseSong(songId: number, receiptData: string): Promise<void> {
  await client.post('/purchases/songs', { song_id: songId, receipt_data: receiptData });
}
