import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Paper,
    Alert,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getEventStatistics, exportAnalytics, extractData } from '../../services/analyticsApi';
import { EventStatistics } from '../../types/analytics';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';

const EventAnalyticsPage = () => {
    const [data, setData] = useState<EventStatistics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getEventStatistics();
            const result = extractData(response);
            setData(result);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Veriler yüklenirken hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format: 'csv' | 'json') => {
        try {
            const response = await exportAnalytics('event', format);
            const blob = new Blob([response.data], {
                type: format === 'csv' ? 'text/csv' : 'application/json',
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `event-analytics.${format}`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            setError('Export işlemi başarısız oldu');
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <LoadingSkeleton variant="chart" count={2} />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Etkinlik Analizi
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Etkinlik katılımı ve performans istatistikleri
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleExport('csv')}
                        aria-label="CSV formatında indir"
                    >
                        CSV İndir
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleExport('json')}
                        aria-label="JSON formatında indir"
                    >
                        JSON İndir
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {!data && !loading && (
                <EmptyState title="Veri Bulunamadı" message="Etkinlik analiz verileri bulunamadı." />
            )}

            {data && (
                <>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Toplam Etkinlik
                                </Typography>
                                <Typography variant="h3" fontWeight="bold">
                                    {data.overallStats.totalEvents}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Toplam Kayıt
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="primary.main">
                                    {data.overallStats.totalRegistrations}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Toplam Katılım
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="secondary.main">
                                    {data.overallStats.totalCheckIns}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Ortalama Katılım Oranı
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="success.main">
                                    {data.overallStats.averageAttendanceRate.toFixed(1)}%
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Etkinlik Katılım Oranları
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.eventPerformance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="eventName" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="attendanceRate" fill="#8884d8" name="Katılım Oranı (%)" />
                                <Bar dataKey="utilizationRate" fill="#82ca9d" name="Doluluk Oranı (%)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Popüler Etkinlikler
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Etkinlik Adı</TableCell>
                                        <TableCell align="right">Kayıt Sayısı</TableCell>
                                        <TableCell align="right">Katılım Oranı</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.popularEvents.map((event) => (
                                        <TableRow key={event.eventId}>
                                            <TableCell>{event.eventName}</TableCell>
                                            <TableCell align="right">{event.registrations}</TableCell>
                                            <TableCell align="right">
                                                {event.attendanceRate.toFixed(1)}%
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </>
            )}
        </Container>
    );
};

export default EventAnalyticsPage;
