import { Card, CardContent, Typography, Box, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Notification, NotificationType } from '../../types/notifications';
import { useNavigate } from 'react-router-dom';

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
}

const getNotificationColor = (type: NotificationType): string => {
    const colors: Record<NotificationType, string> = {
        academic: '#1976d2',
        attendance: '#f57c00',
        meal: '#388e3c',
        event: '#7b1fa2',
        payment: '#d32f2f',
        system: '#455a64',
    };
    return colors[type] || '#757575';
};

const getNotificationLabel = (type: NotificationType): string => {
    const labels: Record<NotificationType, string> = {
        academic: 'Akademik',
        attendance: 'Yoklama',
        meal: 'Yemek',
        event: 'Etkinlik',
        payment: 'Ödeme',
        system: 'Sistem',
    };
    return labels[type] || type;
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete }: NotificationItemProps) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (!notification.isRead) {
            onMarkAsRead(notification.id);
        }
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(notification.id);
    };

    const handleMarkAsRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        onMarkAsRead(notification.id);
    };

    return (
        <Card
            sx={{
                mb: 2,
                cursor: notification.actionUrl ? 'pointer' : 'default',
                backgroundColor: notification.isRead ? 'background.paper' : 'action.hover',
                '&:hover': {
                    boxShadow: 3,
                },
            }}
            onClick={handleClick}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Chip
                                label={getNotificationLabel(notification.type)}
                                size="small"
                                sx={{
                                    backgroundColor: getNotificationColor(notification.type),
                                    color: 'white',
                                }}
                            />
                            {!notification.isRead && (
                                <Box
                                    sx={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: 'error.main',
                                    }}
                                />
                            )}
                        </Box>
                        <Typography variant="subtitle1" fontWeight={notification.isRead ? 400 : 600}>
                            {notification.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {new Date(notification.createdAt).toLocaleString('tr-TR')}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {!notification.isRead && (
                            <IconButton size="small" onClick={handleMarkAsRead} title="Okundu işaretle">
                                <CheckCircleIcon fontSize="small" />
                            </IconButton>
                        )}
                        <IconButton size="small" onClick={handleDelete} color="error" title="Sil">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default NotificationItem;
