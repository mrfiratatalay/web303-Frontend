import { AuthPayload } from '../types/auth';

export const AUTH_USER_KEY = 'auth_user';
export const AUTH_TOKEN_KEY = 'auth_access_token';
export const AUTH_REFRESH_TOKEN_KEY = 'auth_refresh_token';

type SaveParams = {
  user?: AuthPayload['user'];
  accessToken?: string | null;
  refreshToken?: string | null;
};

export const saveAuth = ({ user, accessToken, refreshToken }: SaveParams) => {
  if (user) {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
  if (accessToken) {
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const loadAuth = (): AuthPayload | null => {
  const storedUser = localStorage.getItem(AUTH_USER_KEY);
  const accessToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY);

  if (!storedUser && !accessToken && !refreshToken) {
    return null;
  }

  return {
    user: storedUser ? (JSON.parse(storedUser) as AuthPayload['user']) : null,
    accessToken: accessToken || null,
    refreshToken: refreshToken || null,
  };
};

export const clearAuth = (): void => {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
};
