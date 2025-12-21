import apiClient from './apiClient';
import { AxiosResponse } from 'axios';
import {
  AttendanceReport,
  AttendanceSession,
  AttendanceSummary,
  ExcuseRequest,
  Section,
} from '../types/academics';

const unwrap = <T>(response: AxiosResponse<{ data: T }> | { data?: T } | T): T =>
  (response as AxiosResponse<{ data: T }>)?.data?.data ?? (response as AxiosResponse<T>)?.data ?? (response as T);

export const createSession = (payload: {
  section_id: string;
  geofence_radius?: number;
  latitude?: number;
  longitude?: number;
}) => apiClient.post<AttendanceSession>('/attendance/sessions', payload);

export const getMySessions = (params?: { section_id?: string; status?: string; limit?: number }) =>
  apiClient.get<AttendanceSession[]>('/attendance/sessions/my-sessions', { params });

export const getSession = (id: string) => apiClient.get<AttendanceSession>(`/attendance/sessions/${id}`);

export const closeSession = (id: string) => apiClient.put(`/attendance/sessions/${id}/close`);

export const checkIn = (sessionId: string, payload: { latitude: number; longitude: number; accuracy?: number; qr_code?: string }) =>
  apiClient.post(`/attendance/sessions/${sessionId}/checkin`, payload);

export const getMyAttendance = () => apiClient.get<AttendanceSummary[]>('/attendance/my-attendance');

export type ActiveSession = {
  id: string;
  course: { code: string; name: string };
  section_number: string;
  instructor: string | null;
  date: string;
  start_time: string;
  qr_code: string;
  latitude: number;
  longitude: number;
  geofence_radius: number;
  already_checked_in: boolean;
};

export const getMyActiveSessions = () => apiClient.get<ActiveSession[]>('/attendance/my-active-sessions');

export const getAttendanceReport = (sectionId: string) =>
  apiClient.get<AttendanceReport>(`/attendance/report/${sectionId}`);

export const submitExcuse = (payload: { session_id: string; reason: string; document?: File | null }) => {
  const form = new FormData();
  form.append('session_id', payload.session_id);
  form.append('reason', payload.reason);
  if (payload.document) {
    form.append('document', payload.document);
  }
  return apiClient.post<ExcuseRequest>('/attendance/excuse-requests', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getExcuseRequests = (params?: { status?: string; section_id?: string }) =>
  apiClient.get<ExcuseRequest[]>('/attendance/excuse-requests', { params });

export const approveExcuse = (id: string, notes?: string) =>
  apiClient.put(`/attendance/excuse-requests/${id}/approve`, { notes });

export const rejectExcuse = (id: string, notes?: string) =>
  apiClient.put(`/attendance/excuse-requests/${id}/reject`, { notes });

export const extractData = unwrap;
