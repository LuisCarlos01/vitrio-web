import { describe, expect, it } from 'vitest';
import { toUser } from './user';

describe('toUser', () => {
  it('maps the raw user response body to a domain User', () => {
    const apiResponseBody = {
      id: 'user-1',
      email: 'ana@example.com',
      name: 'Ana Souza',
    };

    expect(toUser(apiResponseBody)).toEqual({
      id: 'user-1',
      email: 'ana@example.com',
      name: 'Ana Souza',
    });
  });

  it('maps a null name (never set) as null, not an empty string', () => {
    const apiResponseBody = {
      id: 'user-1',
      email: 'ana@example.com',
      name: null,
    };

    expect(toUser(apiResponseBody).name).toBeNull();
  });
});
