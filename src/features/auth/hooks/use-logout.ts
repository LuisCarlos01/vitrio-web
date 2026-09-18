import { useRouter } from 'next/navigation';
import { logout } from '../api/logout';
import { useAuthStore } from '../store/auth-store';

export function useLogout() {
  const router = useRouter();

  return async function handleLogout() {
    const { accessToken, refreshToken } = useAuthStore.getState();
    if (accessToken && refreshToken) {
      // Best-effort: revoga o refresh token no servidor, mas a sessão local
      // é sempre limpa mesmo se essa chamada falhar (ex. token já expirado).
      await logout(accessToken, refreshToken).catch(() => {});
    }
    useAuthStore.getState().clearSession();
    router.push('/login');
  };
}
