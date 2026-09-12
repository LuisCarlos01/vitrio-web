import { toSession, type Session } from '@/lib/api/adapters/auth';
import { API_BASE_URL } from '@/lib/api/config';
import { ApiError } from '@/lib/api/errors';

type RegisterPayload = {
  email: string;
  password: string;
};

export async function register(payload: RegisterPayload): Promise<Session> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to register');
  }

  return toSession(await response.json());
}
