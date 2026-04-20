import * as practiceApi from '../api/practice';
import type { SubmitLogRequest } from '../api/practice';
import { syncQueue } from './syncQueue';

// Best-effort submit: try the network, and if that fails for a recoverable
// reason (no network, 5xx, etc.), park the payload on the offline queue
// so it can be flushed later when the user is back online or re-foregrounds
// the app. Caller doesn't need to know which path won — both end up with
// the log eventually reaching the server (or being dropped only if the
// server returned a permanent 4xx).
export async function submitOrQueue(payload: SubmitLogRequest): Promise<void> {
  try {
    await practiceApi.submitPracticeLog(payload);
  } catch (err) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status && status >= 400 && status < 500 && status !== 401) {
      // permanent client error — don't queue garbage forever
      throw err;
    }
    syncQueue.enqueue(payload);
  }
}
