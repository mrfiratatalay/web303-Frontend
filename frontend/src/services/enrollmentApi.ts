import apiClient from './apiClient';
import { Enrollment, EnrollmentQuery, Section, ScheduleEntry } from '../types/academics';
import { AxiosResponse } from 'axios';

const unwrap = <T>(response: AxiosResponse<{ data: T }> | { data?: T } | T): T =>
  (response as AxiosResponse<{ data: T }>)?.data?.data ?? (response as AxiosResponse<T>)?.data ?? (response as T);

export const enrollInSection = (section_id: string) =>
  apiClient.post<Enrollment>('/enrollments', { section_id });

export const dropCourse = (enrollmentId: string) =>
  apiClient.delete<{ message?: string; data?: Enrollment }>(`/enrollments/${enrollmentId}`);

export const getMyCourses = (params?: EnrollmentQuery) =>
  apiClient.get<Enrollment[]>('/enrollments/my-courses', { params });

export const getMySchedule = (params?: { semester?: string; year?: number }) =>
  apiClient.get<ScheduleEntry[]>('/enrollments/my-schedule', { params });

export const getSectionStudents = (sectionId: string) =>
  apiClient.get<Array<{ studentId?: string; studentNumber?: string; name?: string; email?: string }>>(
    `/enrollments/students/${sectionId}`,
  );

export const addSectionStudent = (sectionId: string, student_id: string) =>
  apiClient.post(`/enrollments/sections/${sectionId}/students`, { student_id });

export const removeSectionStudent = (sectionId: string, studentId: string) =>
  apiClient.delete<{ message?: string }>(`/enrollments/sections/${sectionId}/students/${studentId}`);

export const extractData = unwrap;
