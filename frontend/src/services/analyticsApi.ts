import { AxiosResponse } from 'axios';
import apiClient from './apiClient';
import {
    AnalyticsDashboard,
    AcademicPerformance,
    AttendanceAnalytics,
    MealUsageReport,
    EventStatistics,
    ExportFormat,
    AnalyticsType,
} from '../types/analytics';

const unwrap = <T,>(response: AxiosResponse<{ data: T }> | { data?: T } | T): T =>
    (response as AxiosResponse<{ data: T }>)?.data?.data ??
    (response as AxiosResponse<T>)?.data ??
    (response as T);

// Get admin dashboard analytics
export const getAnalyticsDashboard = () =>
    apiClient.get<AnalyticsDashboard>('/analytics/dashboard');

// Get academic performance analytics
export const getAcademicPerformance = () =>
    apiClient.get<AcademicPerformance>('/analytics/academic-performance');

// Get attendance analytics
export const getAttendanceAnalytics = () =>
    apiClient.get<AttendanceAnalytics>('/analytics/attendance');

// Get meal usage report
export const getMealUsageReport = () =>
    apiClient.get<MealUsageReport>('/analytics/meal-usage');

// Get event statistics
export const getEventStatistics = () =>
    apiClient.get<EventStatistics>('/analytics/events');

// Export analytics report
export const exportAnalytics = (type: AnalyticsType, format: ExportFormat) =>
    apiClient.get(`/analytics/export/${type}`, {
        params: { format },
        responseType: 'blob',
    });

export const extractData = unwrap;
