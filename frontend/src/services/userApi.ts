import apiClient from './apiClient';
import { User } from '../types/auth';
import { UserListQuery, UserListResult } from '../types/users';

export const getUsers = (params?: UserListQuery) =>
  apiClient.get<UserListResult>('/users', { params });

export const getUserById = (id: string) => apiClient.get<User>(`/users/${id}`);

export const deleteUser = (id: string) => apiClient.delete(`/users/${id}`);

