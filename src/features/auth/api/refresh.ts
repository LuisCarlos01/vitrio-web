import { toSession, type Session } from '@/lib/api/adapters/auth';
import { API_BASE_URL } from '@/lib/api/config';
import { ApiError } from '@/lib/api/errors';

export async function refresh(refreshToken: string): Promise<Session> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to refresh session');
  }

  return toSession(await response.json());
}
