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
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getMealUsageReport, exportAnalytics, extractData } from '../../services/analyticsApi';
import { MealUsageReport } from '../../types/analytics';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const MealAnalyticsPage = () => {
    const [data, setData] = useState<MealUsageReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getMealUsageReport();
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
            const response = await exportAnalytics('meal', format);
            const blob = new Blob([response.data], {
                type: format === 'csv' ? 'text/csv' : 'application/json',
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `meal-analytics.${format}`;
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
    const dailyChartData = data?.dailyMealCounts?.map(item => ({
        date: new Date(item.date).toLocaleDateString('tr-TR'),
        count: item.count,
    })) || [];

    const peakHoursData = data?.peakHours?.map(item => ({
        hour: `${item.hour}:00`,
        count: item.count,
    })) || [];

    const usageStatsData = data?.usageStats ? [
        { name: 'Kullanılan', value: data.usageStats.used, color: '#4caf50' },
        { name: 'İptal Edilen', value: data.usageStats.cancelled, color: '#f44336' }
    ] : [];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Yemek Kullanım Raporu
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Yemek rezervasyonları ve kullanım istatistikleri
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
                <EmptyState title="Veri Bulunamadı" message="Yemek kullanım verileri bulunamadı." />
            )}

            {data && (
                <>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Toplam Gelir
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="success.main">
                                    {data.totalRevenue?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) ?? '₺0'}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Kullanılan Rezervasyon
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    {data.usageStats?.used ?? 0}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    İptal Edilen
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="error.main">
                                    {data.usageStats?.cancelled ?? 0}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Kullanım Oranı
                                </Typography>
                                <Typography variant="h4" fontWeight="bold" color="info.main">
                                    {data.usageStats ? ((data.usageStats.used / (data.usageStats.used + data.usageStats.cancelled)) * 100).toFixed(1) : 0}%
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        {/* Daily Meal Counts Chart */}
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Günlük Yemek Sayıları (Son 30 Gün)
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={dailyChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="count" stroke="#1976d2" name="Yemek Sayısı" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>

                        {/* Usage Stats Pie Chart */}
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Kullanım İstatistikleri
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={usageStatsData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={(entry: any) => `${entry.name}: ${entry.value}`}
                                            outerRadius={80}
                                            dataKey="value"
                                        >
                                            {usageStatsData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Peak Hours Chart */}
                    {peakHoursData.length > 0 && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Yoğun Saatler
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={peakHoursData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#ff7300" name="Kullanım Sayısı" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    )}

                    {/* Daily Meal Counts Table */}
                    {data.dailyMealCounts && data.dailyMealCounts.length > 0 && (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Günlük Yemek Detayları
                            </Typography>
                            <TableContainer sx={{ maxHeight: 400 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Tarih</TableCell>
                                            <TableCell align="right">Yemek Sayısı</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.dailyMealCounts.slice(0, 10).map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {new Date(item.date).toLocaleDateString('tr-TR')}
                                                </TableCell>
                                                <TableCell align="right">{item.count}</TableCell>
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

export default MealAnalyticsPage;
