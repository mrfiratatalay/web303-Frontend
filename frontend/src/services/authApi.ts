import apiClient from './apiClient';
import { AuthPayload, User } from '../types/auth';

export const login = (data: { email: string; password: string }) =>
  apiClient.post<AuthPayload>('/auth/login', data);

export const register = (data: Record<string, unknown>) =>
  apiClient.post<{ message: string }>('/auth/register', data);

export const verifyEmail = (token: string) => apiClient.post<{ message: string }>('/auth/verify-email', { token });

export const forgotPassword = (email: string) =>
  apiClient.post<{ message: string }>('/auth/forgot-password', { email });

export const resetPassword = ({ token, password }: { token: string; password: string }) =>
  apiClient.post<{ message: string }>('/auth/reset-password', { token, password });

export const getCurrentUser = () => apiClient.get<User>('/users/me');

export const updateProfile = (data: Partial<User>) => apiClient.put<User>('/users/me', data);

export const uploadProfilePicture = (file: File) => {
  const formData = new FormData();
  formData.append('profilePicture', file);

  return apiClient.post<{ profilePictureUrl: string; message: string }>(
    '/users/me/profile-picture',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
};

export const changePassword = (payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => apiClient.put<{ message: string }>('/users/me/password', payload);

export const logout = () => apiClient.post('/auth/logout');
