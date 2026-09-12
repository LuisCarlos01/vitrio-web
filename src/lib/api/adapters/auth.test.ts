import { describe, expect, it } from 'vitest';
import { toSession } from './auth';

describe('toSession', () => {
  it('maps the raw auth response body to a domain Session', () => {
    const apiResponseBody = {
      accessToken: 'abc',
      refreshToken: 'def',
    };

    expect(toSession(apiResponseBody)).toEqual({
      accessToken: 'abc',
      refreshToken: 'def',
    });
  });
});
