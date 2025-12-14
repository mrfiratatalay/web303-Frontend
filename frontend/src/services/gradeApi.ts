import apiClient from './apiClient';
import { AxiosResponse } from 'axios';
import { GradeEntry, Transcript } from '../types/academics';

const unwrap = <T>(response: AxiosResponse<{ data: T }> | { data?: T } | T): T =>
  (response as AxiosResponse<{ data: T }>)?.data?.data ?? (response as AxiosResponse<T>)?.data ?? (response as T);

export const getMyGrades = () => apiClient.get<GradeEntry[]>('/grades/my-grades');

export const getTranscript = () => apiClient.get<Transcript>('/grades/transcript');

export const downloadTranscriptPdf = async () => {
  const response = await apiClient.get<ArrayBuffer>('/grades/transcript/pdf', {
    responseType: 'blob',
  });
  return response;
};

export const enterGrade = (payload: { enrollment_id: string; midterm_grade?: number | null; final_grade?: number | null }) =>
  apiClient.post('/grades', payload);

export const bulkEnterGrades = (grades: Array<{ enrollment_id: string; midterm_grade?: number | null; final_grade?: number | null }>) =>
  apiClient.post('/grades/bulk', { grades });

export const extractData = unwrap;
