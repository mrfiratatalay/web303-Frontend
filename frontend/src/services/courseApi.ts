import { AxiosResponse } from 'axios';
import apiClient from './apiClient';
import { Course, CourseListQuery, CourseListResult } from '../types/academics';

const unwrap = <T>(response: AxiosResponse<{ data: T }> | { data?: T } | T): T =>
  (response as AxiosResponse<{ data: T }>)?.data?.data ?? (response as AxiosResponse<T>)?.data ?? (response as T);

export type CoursePayload = {
  code: string;
  name: string;
  description?: string | null;
  credits: number;
  ects: number;
  syllabus_url?: string | null;
  department_id: string;
  prerequisite_ids?: string[];
};

export const getCourses = (params?: CourseListQuery) =>
  apiClient.get<CourseListResult>('/courses', { params });

export const getCourseById = (id: string) => apiClient.get<Course>(`/courses/${id}`);

export const createCourse = (payload: CoursePayload) =>
  apiClient.post<Course>('/courses', payload);

export const updateCourse = (id: string, payload: Partial<CoursePayload>) =>
  apiClient.put<Course>(`/courses/${id}`, payload);

export const deleteCourse = (id: string) => apiClient.delete<{ message?: string }>(`/courses/${id}`);

export const extractData = unwrap;
