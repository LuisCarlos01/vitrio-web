import { useMutation } from '@tanstack/react-query';
import { register } from '../api/register';
import { useAuthStore } from '../store/auth-store';

export function useRegister() {
  return useMutation({
    mutationFn: register,
    onSuccess: (session) => {
      useAuthStore.getState().setSession(session);
    },
  });
}
