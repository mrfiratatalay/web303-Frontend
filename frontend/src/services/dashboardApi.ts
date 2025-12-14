import { AxiosResponse } from 'axios';
import apiClient from './apiClient';
import { DashboardData } from '../types/dashboard';

const unwrap = <T,>(response: AxiosResponse<{ data: T }> | { data?: T } | T): T =>
  (response as AxiosResponse<{ data: T }>)?.data?.data ??
  (response as AxiosResponse<T>)?.data ??
  (response as T);

export const getDashboard = () => apiClient.get<DashboardData>('/dashboard');

export const extractDashboard = unwrap<DashboardData>;
