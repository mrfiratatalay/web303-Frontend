import apiClient from './apiClient';
import { Section, SectionListQuery, SectionListResult } from '../types/academics';
import { AxiosResponse } from 'axios';

const unwrap = <T>(response: AxiosResponse<{ data: T }> | { data?: T } | T): T =>
  (response as AxiosResponse<{ data: T }>)?.data?.data ?? (response as AxiosResponse<T>)?.data ?? (response as T);

export type SectionPayload = {
  course_id: string;
  section_number?: string;
  semester: 'fall' | 'spring' | 'summer';
  year: number;
  instructor_id: string;
  capacity?: number;
  classroom_id?: string | null;
  schedule_json?: Section['schedule_json'];
};

export const getSections = (params?: SectionListQuery) =>
  apiClient.get<SectionListResult>('/sections', { params });

export const getSectionById = (id: string) => apiClient.get<Section>(`/sections/${id}`);

export const createSection = (payload: SectionPayload) =>
  apiClient.post<Section>('/sections', payload);

export const updateSection = (id: string, payload: Partial<SectionPayload>) =>
  apiClient.put<Section>(`/sections/${id}`, payload);

export const extractData = unwrap;
