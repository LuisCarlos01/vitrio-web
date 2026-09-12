import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from './config';
import { ApiError } from './errors';

export async function authenticatedFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const accessToken = useAuthStore.getState().accessToken;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `Request failed: ${path}`);
  }

  return response;
}
