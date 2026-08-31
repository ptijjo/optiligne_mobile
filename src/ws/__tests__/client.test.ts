import { connectGuidanceWs } from '@/ws/client';

class FakeSocket {
  static instances: FakeSocket[] = [];
  url: string;
  readyState = 1;
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  constructor(url: string) {
    this.url = url;
    FakeSocket.instances.push(this);
    queueMicrotask(() => this.onopen?.());
  }
  send(data: string) {
    this.sent.push(data);
  }
  close() {
    this.readyState = 3;
    this.onclose?.();
  }
}

describe('client WS', () => {
  beforeEach(() => {
    FakeSocket.instances = [];
  });

  it('connecte /ws/guidance sans identifiants', () => {
    const onGuidance = jest.fn();
    connectGuidanceWs('sess_1', { onGuidance }, { WebSocket: FakeSocket as unknown as typeof WebSocket });
    expect(FakeSocket.instances[0]?.url).toBe('ws://127.0.0.1:9191/ws/guidance?session_id=sess_1');
    expect(FakeSocket.instances[0]?.url).not.toMatch(/token/);
  });

  it('position → handler guidance parsé', () => {
    const onGuidance = jest.fn();
    const client = connectGuidanceWs(
      'sess_1',
      { onGuidance },
      { WebSocket: FakeSocket as unknown as typeof WebSocket },
    );
    const sock = FakeSocket.instances[0];
    sock?.onmessage?.({
      data: JSON.stringify({
        type: 'guidance',
        frac: 0.1,
        offset_m: 3,
        next_stop: 'METZ',
        delay_s: 0,
        state: 'on_route',
      }),
    });
    expect(onGuidance).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'guidance', next_stop: 'METZ', state: 'on_route' }),
    );
    client.sendPosition({ lat: 49.1, lon: 6.17, ts: 1, heading: 90 });
    expect(JSON.parse(sock?.sent[0] ?? '')).toMatchObject({
      type: 'position',
      lat: 49.1,
      lon: 6.17,
      ts: 1,
      heading: 90,
    });
  });

  it('parse invalide n’appelle pas le handler', () => {
    const onGuidance = jest.fn();
    connectGuidanceWs('sess_1', { onGuidance }, { WebSocket: FakeSocket as unknown as typeof WebSocket });
    FakeSocket.instances[0]?.onmessage?.({ data: 'nope' });
    expect(onGuidance).not.toHaveBeenCalled();
  });

  it('close coupe la socket', () => {
    const client = connectGuidanceWs(
      'sess_1',
      { onGuidance: jest.fn() },
      { WebSocket: FakeSocket as unknown as typeof WebSocket },
    );
    client.close();
    expect(FakeSocket.instances[0]?.readyState).toBe(3);
  });
});
