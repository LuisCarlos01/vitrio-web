import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { proxy } from './proxy';

function buildRequest(pathname: string, cookie?: string) {
  return new NextRequest(`https://example.com${pathname}`, {
    headers: cookie ? { cookie } : undefined,
  });
}

describe('proxy', () => {
  it('redirects the root URL to /login when there is no session', () => {
    const response = proxy(buildRequest('/'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://example.com/login');
  });

  it('redirects the root URL to /dashboard when there is a session', () => {
    const response = proxy(buildRequest('/', 'has-session=1'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://example.com/dashboard',
    );
  });

  it('redirects a protected route to /login when there is no session', () => {
    const response = proxy(buildRequest('/dashboard'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://example.com/login');
  });

  it('lets a protected route through when there is a session', () => {
    const response = proxy(buildRequest('/dashboard', 'has-session=1'));

    expect(response.headers.get('location')).toBeNull();
  });
});
