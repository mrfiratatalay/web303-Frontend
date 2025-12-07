import { AxiosResponse } from 'axios';
import { ReactNode, createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from '../services/authApi';
import { clearAuth, loadAuth, saveAuth } from '../utils/storage';
import { AuthPayload, User } from '../types/auth';

type LoginCredentials = { email: string; password: string };

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<User | null>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  loadCurrentUser: () => Promise<User>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

const unwrapResponse = <T,>(response: AxiosResponse<{ data: T }> | { data?: T } | T): T =>
  (response as AxiosResponse<{ data: T }>)?.data?.data ??
  (response as AxiosResponse<T>)?.data ??
  (response as T);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeAuth = useCallback(async () => {
    const stored: AuthPayload | null = loadAuth();
    if (stored?.accessToken) {
      setAccessToken(stored.accessToken);
      setRefreshToken(stored.refreshToken ?? null);
      try {
        const response = await getCurrentUser();
        const profile = unwrapResponse<User>(response);
        setUser(profile);
      } catch (err) {
        clearAuth();
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<User | null> => {
    setError(null);
    const response = await loginRequest(credentials);
    const payload = unwrapResponse<AuthPayload>(response);
    const { user: loginUser, accessToken: token, refreshToken: refresh } = payload || {};

    setUser(loginUser || null);
    setAccessToken(token || null);
    setRefreshToken(refresh || null);
    saveAuth({ user: loginUser, accessToken: token, refreshToken: refresh });

    return loginUser || null;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (err) {
      // ignore logout errors
    } finally {
      clearAuth();
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    }
  }, []);

  const loadCurrentUser = useCallback(async (): Promise<User> => {
    const response = await getCurrentUser();
    const profile = unwrapResponse<User>(response);
    setUser(profile);
    saveAuth({ user: profile, accessToken, refreshToken });
    return profile;
  }, [accessToken, refreshToken]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      isLoading,
      error,
      login,
      logout,
      setUser,
      loadCurrentUser,
    }),
    [user, accessToken, refreshToken, isLoading, error, login, logout, loadCurrentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
