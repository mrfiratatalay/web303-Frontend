import { AxiosResponse } from 'axios';
import apiClient from './apiClient';
import { GenerateSchedulePayload, Schedule } from '../types/scheduling';

const unwrap = <T>(response: AxiosResponse<{ data: T }> | { data?: T } | T): T =>
  (response as AxiosResponse<{ data: T }>)?.data?.data ?? (response as AxiosResponse<T>)?.data ?? (response as T);

export const getMySchedule = () => apiClient.get<Schedule | Schedule[]>('/scheduling/my-schedule');

export const getScheduleById = (scheduleId: string) => apiClient.get<Schedule>(`/scheduling/${scheduleId}`);

export const generateSchedule = (payload: GenerateSchedulePayload) =>
  apiClient.post<{ scheduleId?: string; id?: string; message?: string }>(`/scheduling/generate`, payload);

export const downloadMyScheduleIcal = async () => {
  const response = await apiClient.get<ArrayBuffer>('/scheduling/my-schedule/ical', {
    responseType: 'blob',
  });
  return response;
};

export const extractData = unwrap;
