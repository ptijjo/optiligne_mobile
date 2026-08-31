import { getConfig } from '@/config';
import { isValidPosition, parseGuidanceMessage, type GuidanceMessage } from '@/ws/parse';

const QUEUE_MAX = 8;

export type PositionPayload = {
  lat: number;
  lon: number;
  ts: number;
  heading?: number;
};

export type GuidanceSocket = {
  sendPosition: (payload: PositionPayload) => void;
  close: () => void;
};

type Handlers = {
  onGuidance: (msg: GuidanceMessage) => void;
  onClose?: () => void;
};

type Deps = {
  WebSocket: typeof WebSocket;
};

export function connectGuidanceWs(
  sessionId: string,
  handlers: Handlers,
  deps: Deps = { WebSocket },
): GuidanceSocket {
  const url = `${getConfig().wsUrl.replace(/\/$/, '')}/ws/guidance?session_id=${encodeURIComponent(sessionId)}`;
  const socket = new deps.WebSocket(url);
  const queue: string[] = [];
  let lastTs = 0;
  let closed = false;

  const flush = () => {
    if (socket.readyState !== 1) {
      return;
    }
    while (queue.length > 0) {
      const next = queue.shift();
      if (next) {
        socket.send(next);
      }
    }
  };

  socket.onopen = () => {
    flush();
  };

  socket.onmessage = (event: { data: string }) => {
    const parsed = parseGuidanceMessage(String(event.data));
    if (parsed) {
      handlers.onGuidance(parsed);
    }
  };

  socket.onclose = () => {
    handlers.onClose?.();
  };

  return {
    sendPosition(payload) {
      if (closed || !isValidPosition(payload.lat, payload.lon)) {
        return;
      }
      if (payload.ts > 0 && payload.ts < lastTs) {
        return;
      }
      lastTs = payload.ts;
      const body = JSON.stringify({
        type: 'position',
        lat: payload.lat,
        lon: payload.lon,
        ts: payload.ts,
        heading: payload.heading ?? 0,
      });
      if (queue.length >= QUEUE_MAX) {
        queue.shift();
      }
      queue.push(body);
      flush();
    },
    close() {
      closed = true;
      queue.length = 0;
      socket.close();
    },
  };
}
