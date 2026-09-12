import { useMutation } from '@tanstack/react-query';
import { login } from '../api/login';
import { useAuthStore } from '../store/auth-store';

export function useLogin() {
  return useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      useAuthStore.getState().setSession(session);
    },
  });
}
