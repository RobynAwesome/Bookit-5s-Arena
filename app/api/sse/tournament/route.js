import sseEmitter from '@/lib/sseEmitter';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * SSE endpoint for tournament real-time updates
 * Streams: standings-update, fixture-update, team-update, score-live
 */
export async function GET() {
  const encoder = new TextEncoder();
  // cleanup lives outside the ReadableStream constructor to avoid TDZ ReferenceError
  let cleanupFn = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection confirmation
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`)
      );

      // Heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Subscribe to tournament channel
      const onEvent = (data) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // Client disconnected — cleanup handled in cancel()
        }
      };

      sseEmitter.subscribe('tournament', onEvent);

      // Store cleanup in outer-scope variable (safe — no TDZ issue)
      cleanupFn = () => {
        clearInterval(heartbeat);
        sseEmitter.unsubscribe('tournament', onEvent);
      };
    },
    cancel() {
      if (cleanupFn) cleanupFn();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}
