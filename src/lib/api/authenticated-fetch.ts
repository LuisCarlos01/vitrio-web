import { refresh } from '@/features/auth/api/refresh';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from './config';
import { ApiError } from './errors';

// Compartilhado entre chamadas concorrentes: se duas requisições levam 401 ao
// mesmo tempo, só a primeira dispara o refresh de verdade — as outras esperam
// a mesma promise em vez de cada uma tentar renovar o token por conta própria.
let refreshPromise: Promise<void> | null = null;

// Rejeita com ApiError(401|403) quando a própria API confirma que o refresh token é
// inválido/revogado — só nesse caso a sessão deve ser encerrada. Qualquer outro erro
// (rede fora do ar, 5xx) sobe como falha transitória, sem derrubar o usuário.
function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { refreshToken } = useAuthStore.getState();
      if (!refreshToken) {
        throw new ApiError(401, 'No refresh token available');
      }
      try {
        const session = await refresh(refreshToken);
        useAuthStore.getState().setSession(session);
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

function buildHeaders(init: RequestInit, accessToken: string | null) {
  const isFormData = init.body instanceof FormData;
  // new Headers(init.headers) normaliza os 3 formatos aceitos por RequestInit.headers
  // (objeto plano, Headers, array de tuplas) — um object spread só cobre o primeiro.
  const headers = new Headers(init.headers);
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return headers;
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
    let sessionExpired = false;
    try {
      await refreshSession();
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        sessionExpired = true;
      } else {
        // Falha transitória (rede, 5xx) — não é a API dizendo que o refresh token é
        // inválido, então não desloga o usuário por causa de instabilidade.
        throw error;
      }
    }

    if (!sessionExpired) {
      const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: buildHeaders(init, useAuthStore.getState().accessToken),
      });
      if (retryResponse.ok) {
        return retryResponse;
      }
      if (retryResponse.status !== 401) {
        throw new ApiError(retryResponse.status, `Request failed: ${path}`);
      }
      // Token novo e ainda assim 401 — confirma sessão inválida mesmo pós-refresh.
      sessionExpired = true;
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
