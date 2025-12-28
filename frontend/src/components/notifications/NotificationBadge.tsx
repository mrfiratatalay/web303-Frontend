import { useEffect, useState, useCallback } from 'react';
import {
    Badge,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Box,
    Divider,
    Chip,
    Skeleton,
    Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import SettingsIcon from '@mui/icons-material/Settings';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useNavigate } from 'react-router-dom';
import { getUnreadCount, getNotifications, markAsRead, markAllAsRead, extractData } from '../../services/notificationApi';
import { Notification, NotificationType } from '../../types/notifications';

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

const NotificationBadge = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();

    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await getUnreadCount();
            const data = extractData(response);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, []);

    const fetchRecentNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getNotifications({ page: 1, limit: 5, isRead: false });
            const data = extractData(response);
            setRecentNotifications(data.notifications || []);
        } catch (error) {
            console.error('Failed to fetch recent notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [fetchUnreadCount]);

    const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        await fetchRecentNotifications();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
            setUnreadCount((prev) => Math.max(0, prev - 1));
            setRecentNotifications((prev) =>
                prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
            );
        }
        handleClose();
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        setUnreadCount(0);
        setRecentNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const handleViewAll = () => {
        handleClose();
        navigate('/notifications');
    };

    const handleViewPreferences = () => {
        handleClose();
        navigate('/notifications/preferences');
    };

    // Format relative time
    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Az önce';
        if (diffMins < 60) return `${diffMins}dk`;
        if (diffHours < 24) return `${diffHours}sa`;
        return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge 
                    badgeContent={unreadCount} 
                    color="error"
                    max={99}
                    sx={{
                        '& .MuiBadge-badge': {
                            animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                            '@keyframes pulse': {
                                '0%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.1)' },
                                '100%': { transform: 'scale(1)' },
                            },
                        },
                    }}
                >
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: { 
                        width: 380, 
                        maxWidth: '100%',
                        maxHeight: 500,
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {/* Header */}
                <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6" fontWeight={600}>Bildirimler</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {unreadCount > 0 ? `${unreadCount} okunmamış` : 'Tümü okundu'}
                        </Typography>
                    </Box>
                    {unreadCount > 0 && (
                        <Button
                            size="small"
                            startIcon={<DoneAllIcon />}
                            onClick={handleMarkAllAsRead}
                            sx={{ textTransform: 'none' }}
                        >
                            Tümünü oku
                        </Button>
                    )}
                </Box>
                <Divider />

                {/* Notification List */}
                {loading ? (
                    <Box sx={{ p: 2 }}>
                        {[1, 2, 3].map((i) => (
                            <Box key={i} sx={{ mb: 2 }}>
                                <Skeleton variant="rounded" width={60} height={20} sx={{ mb: 0.5 }} />
                                <Skeleton variant="text" width="80%" />
                                <Skeleton variant="text" width="60%" />
                            </Box>
                        ))}
                    </Box>
                ) : recentNotifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <NotificationsOffIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            Okunmamış bildirim yok
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
                        {recentNotifications.map((notification) => (
                            <MenuItem
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                sx={{
                                    py: 1.5,
                                    px: 2,
                                    alignItems: 'flex-start',
                                    borderLeft: `3px solid ${getNotificationColor(notification.type)}`,
                                    backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                                    '&:hover': {
                                        backgroundColor: 'action.selected',
                                    },
                                }}
                            >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                        <Chip
                                            label={notification.type}
                                            size="small"
                                            sx={{
                                                height: 18,
                                                fontSize: '0.65rem',
                                                backgroundColor: getNotificationColor(notification.type),
                                                color: 'white',
                                            }}
                                        />
                                        <Typography variant="caption" color="text.disabled">
                                            {getRelativeTime(notification.createdAt)}
                                        </Typography>
                                    </Box>
                                    <Typography 
                                        variant="body2" 
                                        fontWeight={notification.isRead ? 400 : 600}
                                        sx={{ 
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {notification.title}
                                    </Typography>
                                    <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {notification.message}
                                    </Typography>
                                </Box>
                            </MenuItem>
                        ))}
                    </Box>
                )}

                <Divider />

                {/* Footer Actions */}
                <Box sx={{ display: 'flex' }}>
                    <MenuItem onClick={handleViewAll} sx={{ flex: 1, justifyContent: 'center' }}>
                        <OpenInNewIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">Tümünü Gör</Typography>
                    </MenuItem>
                    <Divider orientation="vertical" flexItem />
                    <MenuItem onClick={handleViewPreferences} sx={{ flex: 1, justifyContent: 'center' }}>
                        <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">Ayarlar</Typography>
                    </MenuItem>
                </Box>
            </Menu>
        </>
    );
};

export default NotificationBadge;
