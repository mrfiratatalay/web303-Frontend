import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Switch,
    FormControlLabel,
    Button,
    Alert,
    CircularProgress,
    Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import {
    getNotificationPreferences,
    updateNotificationPreferences,
    extractData,
} from '../../services/notificationApi';
import { NotificationPreferences } from '../../types/notifications';

const NotificationPreferencesPage = () => {
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        email_preferences: {
            academic: true,
            attendance: true,
            meal: true,
            event: true,
            payment: true,
            system: true,
        },
        push_preferences: {
            academic: true,
            attendance: true,
            meal: true,
            event: true,
            payment: true,
            system: true,
        },
        sms_preferences: {
            academic: false,
            attendance: false,
            meal: false,
            event: false,
            payment: false,
            system: false,
        },
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getNotificationPreferences();
            const data = extractData(response);
            if (data.preferences) {
                setPreferences(data.preferences);
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Tercihler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await updateNotificationPreferences(preferences);
            setSuccess('Tercihler başarıyla kaydedildi');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Tercihler kaydedilirken hata oluştu');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = (
        category: 'email_preferences' | 'push_preferences' | 'sms_preferences',
        type: keyof NotificationPreferences['email_preferences']
    ) => {
        setPreferences((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [type]: !prev[category][type],
            },
        }));
    };

    const notificationTypes = [
        { key: 'academic', label: 'Akademik Bildirimler' },
        { key: 'attendance', label: 'Yoklama Bildirimleri' },
        { key: 'meal', label: 'Yemek Bildirimleri' },
        { key: 'event', label: 'Etkinlik Bildirimleri' },
        { key: 'payment', label: 'Ödeme Bildirimleri' },
        { key: 'system', label: 'Sistem Bildirimleri' },
    ];

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Bildirim Tercihleri
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Hangi bildirimleri almak istediğinizi seçin
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    E-posta Bildirimleri
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {notificationTypes.map(({ key, label }) => (
                    <FormControlLabel
                        key={key}
                        control={
                            <Switch
                                checked={preferences.email_preferences[key as keyof typeof preferences.email_preferences]}
                                onChange={() => handleToggle('email_preferences', key as any)}
                            />
                        }
                        label={label}
                        sx={{ display: 'block', mb: 1 }}
                    />
                ))}
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Push Bildirimleri
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {notificationTypes.map(({ key, label }) => (
                    <FormControlLabel
                        key={key}
                        control={
                            <Switch
                                checked={preferences.push_preferences[key as keyof typeof preferences.push_preferences]}
                                onChange={() => handleToggle('push_preferences', key as any)}
                            />
                        }
                        label={label}
                        sx={{ display: 'block', mb: 1 }}
                    />
                ))}
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    SMS Bildirimleri
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {notificationTypes.map(({ key, label }) => (
                    <FormControlLabel
                        key={key}
                        control={
                            <Switch
                                checked={preferences.sms_preferences[key as keyof typeof preferences.sms_preferences]}
                                onChange={() => handleToggle('sms_preferences', key as any)}
                            />
                        }
                        label={label}
                        sx={{ display: 'block', mb: 1 }}
                    />
                ))}
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
            </Box>
        </Container>
    );
};

export default NotificationPreferencesPage;
