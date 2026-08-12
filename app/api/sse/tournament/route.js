import sseEmitter from '@/lib/sseEmitter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * SSE endpoint for tournament real-time updates
 * Streams: standings-update, fixture-update, team-update, score-live
 */
export async function GET(request) {
  const encoder = new TextEncoder();
  let cleanupFn = null;

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      const cleanup = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        sseEmitter.unsubscribe('tournament', onEvent);
        request.signal.removeEventListener('abort', cleanup);
      };

      const safeEnqueue = (payload) => {
        if (closed) return false;

        try {
          controller.enqueue(encoder.encode(payload));
          return true;
        } catch {
          cleanup();
          return false;
        }
      };

      const onEvent = (data) => {
        safeEnqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      const heartbeat = setInterval(() => {
        safeEnqueue(': heartbeat\n\n');
      }, 30000);

      sseEmitter.subscribe('tournament', onEvent);
      request.signal.addEventListener('abort', cleanup, { once: true });
      cleanupFn = cleanup;

      safeEnqueue(
        `data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`
      );
    },
    cancel() {
      cleanupFn?.();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
