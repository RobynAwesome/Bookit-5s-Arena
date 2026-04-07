/**
 * Global in-memory SSE pub/sub emitter
 * Survives hot-reload in dev (attached to globalThis)
 * Single-instance in production
 */

class SSEEmitter {
  constructor() {
    this.channels = new Map(); // channel -> Set<callback>
  }

  /**
   * Subscribe a callback to a channel
   * @param {string} channel - e.g. 'tournament', 'league:abc123'
   * @param {Function} callback - receives (data) when event fires
   */
  subscribe(channel, callback) {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel).add(callback);
  }

  /**
   * Unsubscribe a callback from a channel
   */
  unsubscribe(channel, callback) {
    const subs = this.channels.get(channel);
    if (subs) {
      subs.delete(callback);
      if (subs.size === 0) this.channels.delete(channel);
    }
  }

  /**
   * Emit an event to all subscribers on a channel
   * @param {string} channel
   * @param {object} data - will be JSON.stringified and sent as SSE data
   */
  emit(channel, data) {
    const subs = this.channels.get(channel);
    if (subs) {
      for (const callback of subs) {
        try {
          callback(data);
        } catch (err) {
          console.error(`[SSE] Error in subscriber for channel "${channel}":`, err);
        }
      }
    }
  }

  /**
   * Get subscriber count for a channel (useful for monitoring)
   */
  subscriberCount(channel) {
    return this.channels.get(channel)?.size || 0;
  }
}

// Attach to globalThis so it persists across hot-reloads in dev
if (!globalThis.__sseEmitter) {
  globalThis.__sseEmitter = new SSEEmitter();
}

const sseEmitter = globalThis.__sseEmitter;

export default sseEmitter;
