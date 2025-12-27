import { AxiosResponse } from 'axios';
import apiClient from './apiClient';
import {
    Notification,
    NotificationListQuery,
    NotificationListResult,
    UnreadCountResponse,
    NotificationPreferences,
    NotificationPreferencesResponse,
} from '../types/notifications';

const unwrap = <T,>(response: AxiosResponse<{ data: T }> | { data?: T } | T): T =>
    (response as AxiosResponse<{ data: T }>)?.data?.data ??
    (response as AxiosResponse<T>)?.data ??
    (response as T);

// Get notifications list with pagination and filters
export const getNotifications = (params?: NotificationListQuery) =>
    apiClient.get<NotificationListResult>('/notifications', {
        params: { ...params, limit: params?.limit || 20 },
    });

// Get unread notification count
export const getUnreadCount = () =>
    apiClient.get<UnreadCountResponse>('/notifications/unread-count');

// Mark single notification as read
export const markAsRead = (id: string) =>
    apiClient.put<Notification>(`/notifications/${id}/read`);

// Mark all notifications as read
export const markAllAsRead = () =>
    apiClient.put<{ message: string }>('/notifications/mark-all-read');

// Delete notification
export const deleteNotification = (id: string) =>
    apiClient.delete<{ message: string }>(`/notifications/${id}`);

// Get notification preferences
export const getNotificationPreferences = () =>
    apiClient.get<NotificationPreferencesResponse>('/notifications/preferences');

// Update notification preferences
export const updateNotificationPreferences = (preferences: NotificationPreferences) =>
    apiClient.put<NotificationPreferencesResponse>('/notifications/preferences', preferences);

export const extractData = unwrap;
