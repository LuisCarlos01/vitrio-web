import { refresh } from '@/features/auth/api/refresh';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from './config';
import { ApiError } from './errors';

// Compartilhado entre chamadas concorrentes: se duas requisições levam 401 ao
// mesmo tempo, só a primeira dispara o refresh de verdade — as outras esperam
// a mesma promise em vez de cada uma tentar renovar o token por conta própria.
let refreshPromise: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { refreshToken } = useAuthStore.getState();
      if (!refreshToken) return false;
      try {
        const session = await refresh(refreshToken);
        useAuthStore.getState().setSession(session);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

function buildHeaders(init: RequestInit, accessToken: string | null) {
  const isFormData = init.body instanceof FormData;
  return {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...init.headers,
  };
}

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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders(init, useAuthStore.getState().accessToken),
  });

  if (response.status === 401) {
    const refreshed = await refreshSession();

    if (refreshed) {
      const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: buildHeaders(init, useAuthStore.getState().accessToken),
      });
      if (retryResponse.ok) {
        return retryResponse;
      }
    }

    // Sessão expirada de vez (refresh token também venceu/foi revogado) — não
    // há como recuperar sem o usuário logar de novo. Limpa o estado local e
    // manda pro login em vez de deixar a tela presa num erro genérico pra
    // sempre (era esse o bug: 401 sem saída nenhuma pro usuário).
    useAuthStore.getState().clearSession();
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- fora de um componente, sem acesso ao router do Next
      window.location.href = '/login';
    }
    throw new ApiError(401, `Session expired: ${path}`);
  }

  if (!response.ok) {
    throw new ApiError(response.status, `Request failed: ${path}`);
  }

  return response;
}
