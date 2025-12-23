import { AxiosResponse } from 'axios';
import apiClient from './apiClient';
import { Reservation, ReservationCreatePayload } from '../types/reservations';

const unwrap = <T>(response: AxiosResponse<{ data: T }> | { data?: T } | T): T =>
  (response as AxiosResponse<{ data: T }>)?.data?.data ??
  (response as AxiosResponse<T>)?.data ??
  (response as T);

export type Classroom = {
  id: string;
  building: string;
  room_number: string;
  capacity?: number;
  has_projector?: boolean;
  has_ac?: boolean;
};

export const getClassrooms = () => apiClient.get<Classroom[]>('/classrooms');

export const getReservations = (params?: {
  status?: string;
  classroom_id?: string;
  student_id?: string;
  limit?: number;
  page?: number;
}) => apiClient.get<Reservation[]>('/reservations', { params });

export const getMyReservations = () => apiClient.get<Reservation[]>('/reservations/my');

export const getReservationById = (id: string) => apiClient.get<Reservation>(`/reservations/${id}`);

export const createReservation = (payload: ReservationCreatePayload) =>
  apiClient.post<Reservation>('/reservations', payload);

export const approveReservation = (id: string, notes?: string) => {
  const payload = notes ? { notes } : {};
  return apiClient.put(`/reservations/${id}/approve`, payload);
};

export const rejectReservation = (id: string, notes?: string) => {
  const payload = notes ? { notes } : {};
  return apiClient.put(`/reservations/${id}/reject`, payload);
};

export const deleteReservation = (id: string) => apiClient.delete(`/reservations/${id}`);

export const extractData = unwrap;
