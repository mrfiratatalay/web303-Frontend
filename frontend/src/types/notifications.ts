export type NotificationType =
    | 'academic'
    | 'attendance'
    | 'meal'
    | 'event'
    | 'payment'
    | 'system';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
    updatedAt?: string;
    metadata?: Record<string, unknown>;
    actionUrl?: string;
}

export interface NotificationListQuery {
    page?: number;
    limit?: number;
    type?: NotificationType;
    isRead?: boolean;
}

export interface NotificationListResult {
    notifications: Notification[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface UnreadCountResponse {
    unreadCount: number;
}

export interface NotificationPreferenceTypes {
    academic: boolean;
    attendance: boolean;
    meal: boolean;
    event: boolean;
    payment: boolean;
    system: boolean;
}

export interface NotificationPreferences {
    email_preferences: NotificationPreferenceTypes;
    push_preferences: NotificationPreferenceTypes;
    sms_preferences: NotificationPreferenceTypes;
}

export interface NotificationPreferencesResponse {
    preferences: NotificationPreferences;
}
