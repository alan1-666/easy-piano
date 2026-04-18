import { useUserStore } from '../stores/userStore';

export function useAuth() {
  const user = useUserStore((s) => s.user);
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const login = useUserStore((s) => s.login);
  const logout = useUserStore((s) => s.logout);
  const register = useUserStore((s) => s.register);
  const refreshToken = useUserStore((s) => s.refreshToken);

  return {
    user,
    isLoggedIn,
    login,
    logout,
    register,
    refreshToken,
  };
}
