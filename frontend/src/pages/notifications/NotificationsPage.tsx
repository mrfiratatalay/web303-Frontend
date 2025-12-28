import { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    ToggleButtonGroup,
    ToggleButton,
    Alert,
    Skeleton,
    Paper,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    extractData,
} from '../../services/notificationApi';
import { Notification, NotificationType, NotificationListQuery } from '../../types/notifications';
import NotificationList from '../../components/notifications/NotificationList';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [typeFilter, setTypeFilter] = useState<NotificationType | ''>('');
    const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params: NotificationListQuery = { page, limit: 20 };
            if (typeFilter) params.type = typeFilter;
            if (readFilter !== 'all') params.isRead = readFilter === 'read';

            const response = await getNotifications(params);
            const data = extractData(response);

            setNotifications(data.notifications || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error?.response?.data?.message || 'Bildirimler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [page, typeFilter, readFilter]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error?.response?.data?.message || 'Bildirim işaretlenirken hata oluştu');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error?.response?.data?.message || 'Bildirimler işaretlenirken hata oluştu');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteNotification(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            setError(error?.response?.data?.message || 'Bildirim silinirken hata oluştu');
        }
    };

    // Skeleton loader for loading state
    const renderSkeleton = () => (
        <Box>
            {[1, 2, 3, 4].map((i) => (
                <Paper key={i} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Skeleton variant="rounded" width={80} height={24} />
                        <Skeleton variant="circular" width={8} height={8} />
                    </Box>
                    <Skeleton variant="text" width="60%" height={28} />
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" width={120} height={16} sx={{ mt: 1 }} />
                </Paper>
            ))}
        </Box>
    );

    // Empty state component
    const renderEmptyState = () => (
        <Paper
            sx={{
                p: 6,
                textAlign: 'center',
                backgroundColor: 'background.default',
                border: '2px dashed',
                borderColor: 'divider',
            }}
        >
            <NotificationsOffIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
                Bildirim Bulunamadı
            </Typography>
            <Typography variant="body2" color="text.disabled">
                {readFilter === 'unread'
                    ? 'Okunmamış bildiriminiz bulunmuyor. Tebrikler! 🎉'
                    : typeFilter
                    ? `"${typeFilter}" tipinde bildirim bulunmuyor.`
                    : 'Henüz hiç bildiriminiz yok. Yeni bildirimler burada görünecek.'}
            </Typography>
        </Paper>
    );

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Bildirimler
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Tüm bildirimlerinizi buradan görüntüleyebilir ve yönetebilirsiniz
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Tip</InputLabel>
                    <Select
                        value={typeFilter}
                        label="Tip"
                        onChange={(e) => {
                            setTypeFilter(e.target.value as NotificationType | '');
                            setPage(1);
                        }}
                    >
                        <MenuItem value="">Tümü</MenuItem>
                        <MenuItem value="academic">Akademik</MenuItem>
                        <MenuItem value="attendance">Yoklama</MenuItem>
                        <MenuItem value="meal">Yemek</MenuItem>
                        <MenuItem value="event">Etkinlik</MenuItem>
                        <MenuItem value="payment">Ödeme</MenuItem>
                        <MenuItem value="system">Sistem</MenuItem>
                    </Select>
                </FormControl>

                <ToggleButtonGroup
                    value={readFilter}
                    exclusive
                    onChange={(_, value) => {
                        if (value !== null) {
                            setReadFilter(value);
                            setPage(1);
                        }
                    }}
                    size="small"
                >
                    <ToggleButton value="all">Tümü</ToggleButton>
                    <ToggleButton value="unread">Okunmamış</ToggleButton>
                    <ToggleButton value="read">Okunmuş</ToggleButton>
                </ToggleButtonGroup>

                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchNotifications}
                        disabled={loading}
                    >
                        Yenile
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<DoneAllIcon />}
                        onClick={handleMarkAllAsRead}
                        disabled={loading}
                    >
                        Tümünü Okundu İşaretle
                    </Button>
                </Box>
            </Box>

            {loading ? (
                renderSkeleton()
            ) : notifications.length === 0 ? (
                renderEmptyState()
            ) : (
                <NotificationList
                    notifications={notifications}
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                />
            )}
        </Container>
    );
};

export default NotificationsPage;
