import { AxiosResponse } from 'axios';
import apiClient from './apiClient';
import {
  Event,
  EventListQuery,
  EventListResult,
  EventRegistration,
  EventPayload,
} from '../types/events';

const unwrap = <T>(response: AxiosResponse<{ data: T }> | { data?: T } | T): T =>
  (response as AxiosResponse<{ data: T }>)?.data?.data ?? (response as AxiosResponse<T>)?.data ?? (response as T);

export const getEvents = (params?: EventListQuery) =>
  apiClient.get<EventListResult | Event[]>('/events', { params: { ...params, limit: params?.limit || 20 } });

export const getEventById = (id: string) => apiClient.get<Event>(`/events/${id}`);

export const createEvent = (payload: EventPayload) => apiClient.post<Event>('/events', payload);

export const updateEvent = (id: string, payload: Partial<EventPayload>) =>
  apiClient.put<Event>(`/events/${id}`, payload);

export const deleteEvent = (id: string) => apiClient.delete<{ message?: string }>(`/events/${id}`);

export const registerForEvent = (eventId: string) =>
  apiClient.post<EventRegistration>(`/events/${eventId}/register`);

export const cancelRegistration = (eventId: string, registrationId: string) =>
  apiClient.delete<{ message?: string }>(`/events/${eventId}/registrations/${registrationId}`);

export const getEventRegistrations = (eventId: string) =>
  apiClient.get<EventRegistration[]>(`/events/${eventId}/registrations`);

export const checkInRegistration = (eventId: string, registrationId: string) =>
  apiClient.post<{ message?: string }>(`/events/${eventId}/registrations/${registrationId}/checkin`);

export const checkInByQrCode = (qrCode: string) =>
  apiClient.post<{ message?: string }>(`/events/checkin/${qrCode}`);

export const getMyRegistrations = () => apiClient.get<EventRegistration[]>('/events/my-registrations');

export const extractData = unwrap;

export const normalizeEventListResponse = (
  response:
    | AxiosResponse<{ data: EventListResult | Event[] }>
    | { data?: EventListResult | Event[] }
    | EventListResult
    | Event[],
  fallback?: { page?: number; limit?: number },
): EventListResult => {
  const raw = extractData<EventListResult | Event[]>(response);
  const events = Array.isArray(raw) ? raw : raw?.events || [];

  const pagination = !Array.isArray(raw) && raw?.pagination ? raw.pagination : undefined;

  const limit = pagination?.limit ?? fallback?.limit ?? (events.length || 10);
  const page = pagination?.page ?? fallback?.page ?? 1;
  const total = pagination?.total ?? events.length;
  const totalPages = pagination?.totalPages ?? (total && limit ? Math.ceil(total / limit) : 0);

  return {
    events,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};
