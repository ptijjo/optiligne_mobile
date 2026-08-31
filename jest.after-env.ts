import { resetConfig } from '@/config';
import { server } from '@/test/msw/server';

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
  resetConfig();
  const router = require('expo-router') as {
    __router: { push: jest.Mock; replace: jest.Mock; back: jest.Mock };
  };
  router.__router.push.mockClear();
  router.__router.replace.mockClear();
  router.__router.back.mockClear();
  (global as { __routeParams?: Record<string, string> }).__routeParams = {};
});

afterAll(() => {
  server.close();
});
