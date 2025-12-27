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
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, any>;
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

export interface NotificationPreferences {
    email_preferences: {
        academic: boolean;
        attendance: boolean;
        meal: boolean;
        event: boolean;
        payment: boolean;
        system: boolean;
    };
    push_preferences: {
        academic: boolean;
        attendance: boolean;
        meal: boolean;
        event: boolean;
        payment: boolean;
        system: boolean;
    };
    sms_preferences: {
        academic: boolean;
        attendance: boolean;
        meal: boolean;
        event: boolean;
        payment: boolean;
        system: boolean;
    };
}

export interface NotificationPreferencesResponse {
    preferences: NotificationPreferences;
}
