export type TestHandler = (info: { request: Request }) => Promise<Response> | Response;

export type TestRoute = {
  method: string;
  url: string;
  handler: TestHandler;
};

function pathname(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, '');
  } catch {
    return url.split('?')[0].replace(/\/$/, '');
  }
}

export const http = {
  get: (url: string, handler: TestHandler): TestRoute => ({
    method: 'GET',
    url: pathname(url),
    handler,
  }),
  post: (url: string, handler: TestHandler): TestRoute => ({
    method: 'POST',
    url: pathname(url),
    handler,
  }),
};

export const HttpResponse = {
  json(body: unknown, init?: { status?: number }) {
    return new Response(JSON.stringify(body), {
      status: init?.status ?? 200,
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

let routes: TestRoute[] = [];
let originalFetch: typeof fetch | undefined;

export const server = {
  listen() {
    originalFetch = globalThis.fetch.bind(globalThis);
    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request && !init ? input : new Request(input, init);
      const url = pathname(request.url);
      const method = request.method.toUpperCase();
      const match = [...routes].reverse().find((route) => route.method === method && route.url === url);
      if (!match) {
        throw new Error(`Unhandled request: ${method} ${request.url}`);
      }
      if (request.signal.aborted) {
        throw Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' });
      }
      return new Promise<Response>((resolve, reject) => {
        const onAbort = () => {
          reject(Object.assign(new Error('The operation was aborted.'), { name: 'AbortError' }));
        };
        request.signal.addEventListener('abort', onAbort, { once: true });
        Promise.resolve(match.handler({ request })).then(
          (response) => {
            request.signal.removeEventListener('abort', onAbort);
            resolve(response);
          },
          (error) => {
            request.signal.removeEventListener('abort', onAbort);
            reject(error);
          },
        );
      });
    };
  },
  use(...handlers: TestRoute[]) {
    routes.push(...handlers);
  },
  resetHandlers() {
    routes = [];
  },
  close() {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    }
    routes = [];
  },
};
