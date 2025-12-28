import { useState, useEffect } from 'react';
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
    Chip,
    LinearProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getEventStatistics, exportAnalytics, extractData } from '../../services/analyticsApi';
import { EventStatistics } from '../../types/analytics';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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

    // Prepare chart data
    const categoryChartData = data?.eventsByCategory?.map(item => ({
        category: item.category,
        count: item.count,
    })) || [];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Etkinlik Analitiği
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Etkinlik katılım ve kayıt istatistikleri
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleExport('csv')}
                    >
                        CSV İndir
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleExport('json')}
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
                                    Toplam Kayıt
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="primary.main">
                                    {data.totalRegistrations ?? 0}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Check-in Yapan
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="success.main">
                                    {data.checkedInCount ?? 0}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Check-in Oranı
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="info.main">
                                    {data.checkInRate?.toFixed(1) ?? 0}%
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Popüler Etkinlik Sayısı
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="warning.main">
                                    {data.popularEvents?.length ?? 0}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        {/* Events by Category Chart */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Kategorilere Göre Etkinlikler
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={categoryChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="category" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" fill="#1976d2" name="Etkinlik Sayısı" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>

                        {/* Category Pie Chart */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Kategori Dağılımı
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={categoryChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={(entry: any) => `${entry.category}: ${entry.count}`}
                                            outerRadius={80}
                                            dataKey="count"
                                        >
                                            {categoryChartData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Popular Events Table */}
                    {data.popularEvents && data.popularEvents.length > 0 && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                En Popüler Etkinlikler (Top 10)
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Etkinlik Adı</TableCell>
                                            <TableCell>Kategori</TableCell>
                                            <TableCell>Tarih</TableCell>
                                            <TableCell align="right">Kapasite</TableCell>
                                            <TableCell align="right">Kayıt</TableCell>
                                            <TableCell>Doluluk</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.popularEvents.map((event) => {
                                            const fillRate = (event.registrationCount / event.capacity) * 100;
                                            return (
                                                <TableRow key={event.id}>
                                                    <TableCell>{event.title}</TableCell>
                                                    <TableCell>
                                                        <Chip label={event.category} size="small" color="primary" variant="outlined" />
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(event.date).toLocaleDateString('tr-TR')}
                                                    </TableCell>
                                                    <TableCell align="right">{event.capacity}</TableCell>
                                                    <TableCell align="right">{event.registrationCount}</TableCell>
                                                    <TableCell sx={{ minWidth: 120 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <LinearProgress
                                                                variant="determinate"
                                                                value={Math.min(fillRate, 100)}
                                                                sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                                                                color={fillRate >= 90 ? 'error' : fillRate >= 70 ? 'warning' : 'primary'}
                                                            />
                                                            <Typography variant="caption">
                                                                {fillRate.toFixed(0)}%
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}

                    {/* Registrations by Category Table */}
                    {data.registrationsByCategory && data.registrationsByCategory.length > 0 && (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Kategorilere Göre Kayıtlar
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Kategori</TableCell>
                                            <TableCell align="right">Etkinlik Sayısı</TableCell>
                                            <TableCell align="right">Toplam Kapasite</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.registrationsByCategory.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Chip label={item.category} size="small" color="secondary" />
                                                </TableCell>
                                                <TableCell align="right">{item.eventCount}</TableCell>
                                                <TableCell align="right">{item.totalCapacity}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}
                </>
            )}
        </Container>
    );
};

export default EventAnalyticsPage;
