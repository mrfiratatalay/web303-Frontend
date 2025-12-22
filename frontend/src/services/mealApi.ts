import { AxiosResponse } from 'axios';
import {
    Cafeteria,
    MealMenu,
    MealMenuListQuery,
    MealMenuListResult,
    MealReservation,
} from '../types/meals';
import apiClient from './apiClient';

const unwrap = <T>(response: AxiosResponse<{ data: T }> | { data?: T } | T): T =>
  (response as AxiosResponse<{ data: T }>)?.data?.data ?? (response as AxiosResponse<T>)?.data ?? (response as T);

export const getCafeterias = () => apiClient.get<Cafeteria[]>('/meals/cafeterias');

export const getMealMenus = (params?: MealMenuListQuery) =>
  apiClient.get<MealMenuListResult | MealMenu[]>('/meals/menus', { params: { ...params, limit: params?.limit || 20 } });

export const getMealMenuById = (id: string) => apiClient.get<MealMenu>(`/meals/menus/${id}`);

export const createMealReservation = (payload: { menu_id: string }) =>
  apiClient.post<MealReservation>('/meals/reservations', payload);

export const getMyMealReservations = () => apiClient.get<MealReservation[]>('/meals/reservations/my');

export const cancelMealReservation = (id: string) => apiClient.delete<{ message?: string }>(`/meals/reservations/${id}`);

export const useMealReservationQrCode = (qrCode: string) =>
  apiClient.post<{ message?: string }>(`/meals/reservations/${qrCode}/use`);

// Admin operations
export type MealMenuPayload = {
  title?: string;
  date?: string;
  cafeteria_id?: string;
  price?: number;
  items?: { name: string; description?: string; calories?: number }[];
};

export const createMealMenu = (payload: MealMenuPayload) =>
  apiClient.post<MealMenu>('/meals/menus', payload);

export const updateMealMenu = (id: string, payload: Partial<MealMenuPayload>) =>
  apiClient.put<MealMenu>(`/meals/menus/${id}`, payload);

export const deleteMealMenu = (id: string) =>
  apiClient.delete<{ message?: string }>(`/meals/menus/${id}`);

export const extractData = unwrap;

export const normalizeMealMenuListResponse = (
  response:
    | AxiosResponse<{ data: MealMenuListResult | MealMenu[] }>
    | { data?: MealMenuListResult | MealMenu[] }
    | MealMenuListResult
    | MealMenu[],
  fallback?: { page?: number; limit?: number },
): MealMenuListResult => {
  const raw = extractData<MealMenuListResult | MealMenu[]>(response);
  const menus = Array.isArray(raw) ? raw : raw?.menus || [];

  const pagination = !Array.isArray(raw) && raw?.pagination ? raw.pagination : undefined;

  const limit = pagination?.limit ?? fallback?.limit ?? (menus.length || 10);
  const page = pagination?.page ?? fallback?.page ?? 1;
  const total = pagination?.total ?? menus.length;
  const totalPages = pagination?.totalPages ?? (total && limit ? Math.ceil(total / limit) : 0);

  return {
    menus,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};
