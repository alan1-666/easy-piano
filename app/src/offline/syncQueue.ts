import { MMKV } from 'react-native-mmkv';
import * as practiceApi from '../api/practice';
import type { SubmitLogRequest } from '../api/practice';

const storage = new MMKV({ id: 'easypiano' });
const QUEUE_KEY = 'sync.practice_logs';

interface QueuedLog {
  id: string; // local id, not the server-assigned one
  payload: SubmitLogRequest;
  attempts: number;
  enqueuedAt: number;
}

function readQueue(): QueuedLog[] {
  const raw = storage.getString(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedLog[];
  } catch {
    return [];
  }
}

function writeQueue(items: QueuedLog[]): void {
  storage.set(QUEUE_KEY, JSON.stringify(items));
}

let flushInFlight: Promise<void> | null = null;

export const syncQueue = {
  enqueue(payload: SubmitLogRequest): void {
    const items = readQueue();
    items.push({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      payload,
      attempts: 0,
      enqueuedAt: Date.now(),
    });
    writeQueue(items);
  },

  // Flush is idempotent and serialised — concurrent callers share the
  // same in-flight promise so we don't double-submit. Items succeed
  // (drop), get a 4xx (drop — never going to succeed), or hit a network
  // / 5xx error (keep, increment attempts, stop processing the batch
  // because the network is likely down for the rest too).
  async flush(): Promise<void> {
    if (flushInFlight) return flushInFlight;

    flushInFlight = (async () => {
      const items = readQueue();
      if (items.length === 0) return;

      const survivors: QueuedLog[] = [];
      let halted = false;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (halted) {
          survivors.push(item);
          continue;
        }
        try {
          await practiceApi.submitPracticeLog(item.payload);
          // success — drop the item by not adding it to survivors
        } catch (err) {
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status && status >= 400 && status < 500 && status !== 401) {
            // permanent failure (validation, etc.) — drop it; logging is
            // useful so we know we've thrown work away
            console.warn(
              `[syncQueue] dropping log ${item.id}, server returned ${status}`,
            );
          } else {
            // network / 5xx / 401 — keep, bump attempts, halt the batch
            survivors.push({ ...item, attempts: item.attempts + 1 });
            halted = true;
          }
        }
      }
      writeQueue(survivors);
    })();

    try {
      await flushInFlight;
    } finally {
      flushInFlight = null;
    }
  },

  getPendingCount(): number {
    return readQueue().length;
  },

  clear(): void {
    storage.delete(QUEUE_KEY);
  },
};
