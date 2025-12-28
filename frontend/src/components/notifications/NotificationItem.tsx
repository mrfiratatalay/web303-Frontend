import { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Fade,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
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
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleClick = () => {
        if (!notification.isRead) {
            onMarkAsRead(notification.id);
        }
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        await onDelete(notification.id);
        setIsDeleting(false);
        setDeleteDialogOpen(false);
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
    };

    const handleMarkAsRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        onMarkAsRead(notification.id);
    };

    // Format relative time
    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Az önce';
        if (diffMins < 60) return `${diffMins} dakika önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <>
            <Fade in timeout={300}>
                <Card
                    sx={{
                        mb: 2,
                        cursor: notification.actionUrl ? 'pointer' : 'default',
                        backgroundColor: notification.isRead ? 'background.paper' : 'action.hover',
                        borderLeft: notification.isRead ? 'none' : `4px solid ${getNotificationColor(notification.type)}`,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            boxShadow: 4,
                            transform: 'translateY(-2px)',
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
                                            fontWeight: 500,
                                        }}
                                    />
                                    {!notification.isRead && (
                                        <Box
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                backgroundColor: 'error.main',
                                                animation: 'pulse 2s infinite',
                                                '@keyframes pulse': {
                                                    '0%': { opacity: 1 },
                                                    '50%': { opacity: 0.5 },
                                                    '100%': { opacity: 1 },
                                                },
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
                                <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                                    {getRelativeTime(notification.createdAt)}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                {!notification.isRead && (
                                    <IconButton 
                                        size="small" 
                                        onClick={handleMarkAsRead} 
                                        title="Okundu işaretle"
                                        sx={{ 
                                            color: 'success.main',
                                            '&:hover': { backgroundColor: 'success.light', color: 'white' }
                                        }}
                                    >
                                        <CheckCircleIcon fontSize="small" />
                                    </IconButton>
                                )}
                                <IconButton 
                                    size="small" 
                                    onClick={handleDeleteClick} 
                                    title="Sil"
                                    sx={{ 
                                        color: 'error.light',
                                        '&:hover': { backgroundColor: 'error.light', color: 'white' }
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Fade>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
                onClick={(e) => e.stopPropagation()}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningAmberIcon color="warning" />
                    Bildirimi Sil
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        "<strong>{notification.title}</strong>" bildirimini silmek istediğinize emin misiniz? 
                        Bu işlem geri alınamaz.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} disabled={isDeleting}>
                        İptal
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        color="error" 
                        variant="contained"
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Siliniyor...' : 'Sil'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default NotificationItem;
