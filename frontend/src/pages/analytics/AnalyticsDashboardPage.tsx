import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Paper,
    CircularProgress,
    Alert,
    Card,
    CardContent,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import EventIcon from '@mui/icons-material/Event';
import { getAnalyticsDashboard, extractData } from '../../services/analyticsApi';
import { AnalyticsDashboard } from '../../types/analytics';

const AnalyticsDashboardPage = () => {
    const [data, setData] = useState<AnalyticsDashboard | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getAnalyticsDashboard();
            const result = extractData(response);
            setData(result);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Veriler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, color }: any) => (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography color="text.secondary" variant="body2" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                            {value ?? 0}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            backgroundColor: `${color}.lighter`,
                            borderRadius: 2,
                            p: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Analytics Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Sistem genelindeki istatistikler ve önemli metrikler
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {data && (
                <>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <StatCard
                                title="Toplam Kullanıcı"
                                value={data.totalUsers}
                                icon={<PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
                                color="primary"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <StatCard
                                title="Bugün Aktif Kullanıcı"
                                value={data.activeUsersToday}
                                icon={<TrendingUpIcon sx={{ fontSize: 40, color: 'success.main' }} />}
                                color="success"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <StatCard
                                title="Toplam Ders"
                                value={data.totalCourses}
                                icon={<ClassIcon sx={{ fontSize: 40, color: 'info.main' }} />}
                                color="info"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <StatCard
                                title="Toplam Kayıt"
                                value={data.totalEnrollments}
                                icon={<SchoolIcon sx={{ fontSize: 40, color: 'secondary.main' }} />}
                                color="secondary"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <StatCard
                                title="Bugünkü Yemek Rezervasyonu"
                                value={data.mealReservationsToday}
                                icon={<RestaurantIcon sx={{ fontSize: 40, color: 'warning.main' }} />}
                                color="warning"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <StatCard
                                title="Yaklaşan Etkinlik"
                                value={data.upcomingEvents}
                                icon={<EventIcon sx={{ fontSize: 40, color: 'error.main' }} />}
                                color="error"
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Yoklama Oranı
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Son 30 Gün Ortalaması
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold">
                                        {data.attendanceRate?.toFixed(1) ?? 0}%
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Sistem Durumu
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Durum
                                    </Typography>
                                    <Typography
                                        variant="h5"
                                        fontWeight="bold"
                                        color={
                                            data.systemHealth === 'healthy'
                                                ? 'success.main'
                                                : data.systemHealth === 'warning'
                                                    ? 'warning.main'
                                                    : 'error.main'
                                        }
                                    >
                                        {data.systemHealth === 'healthy'
                                            ? 'Sağlıklı'
                                            : data.systemHealth === 'warning'
                                                ? 'Uyarı'
                                                : 'Kritik'}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            )}
        </Container>
    );
};

export default AnalyticsDashboardPage;
