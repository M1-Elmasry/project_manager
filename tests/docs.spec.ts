import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import app from '@app';

describe('Docs', () => {
  test('Docs are hosted on /docs', async () => {
    const res = await app.request('/docs');
    expect(res.status).toBe(200);
  });

  test('Redirect / to /docs', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('/docs');
  });
});
