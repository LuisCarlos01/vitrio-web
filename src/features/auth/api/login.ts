import { toSession, type Session } from '@/lib/api/adapters/auth';
import { API_BASE_URL } from '@/lib/api/config';
import { ApiError } from '@/lib/api/errors';

type LoginCredentials = {
  email: string;
  password: string;
};

export async function login(credentials: LoginCredentials): Promise<Session> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new ApiError(response.status, 'Failed to log in');
  }

  return toSession(await response.json());
}
