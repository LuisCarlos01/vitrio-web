import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from './config';
import { ApiError } from './errors';

export async function authenticatedFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  if (
    process.env.NODE_ENV === 'production' &&
    API_BASE_URL.startsWith('http://')
  ) {
    throw new Error(
      'Refusing to send an authenticated request over plain HTTP in production. ' +
        'NEXT_PUBLIC_API_URL must use https://.',
    );
  }

  const accessToken = useAuthStore.getState().accessToken;
  const isFormData = init.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `Request failed: ${path}`);
  }

  return response;
}
