import { toUser, type User } from '@/lib/api/adapters/user';
import { authenticatedFetch } from '@/lib/api/authenticated-fetch';

export async function getMe(): Promise<User> {
  const response = await authenticatedFetch('/api/v1/users/me');
  return toUser(await response.json());
}

export async function updateMe(payload: { name: string }): Promise<User> {
  const response = await authenticatedFetch('/api/v1/users/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return toUser(await response.json());
}
