import { useState, useEffect } from 'react';
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
    CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    extractData,
} from '../../services/notificationApi';
import { NotificationType } from '../../types/notifications';
import NotificationList from '../../components/notifications/NotificationList';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [typeFilter, setTypeFilter] = useState<NotificationType | ''>('');
    const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all');

    const fetchNotifications = async () => {
        setLoading(true);
        setError('');
        try {
            const params: any = { page, limit: 20 };
            if (typeFilter) params.type = typeFilter;
            if (readFilter !== 'all') params.isRead = readFilter === 'read';

            const response = await getNotifications(params);
            const data = extractData(response);

            setNotifications(data.notifications || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Bildirimler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [page, typeFilter, readFilter]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Bildirim işaretlenirken hata oluştu');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Bildirimler işaretlenirken hata oluştu');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteNotification(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Bildirim silinirken hata oluştu');
        }
    };

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
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : notifications.length === 0 ? (
                <Alert severity="info">Bildirim bulunamadı</Alert>
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
