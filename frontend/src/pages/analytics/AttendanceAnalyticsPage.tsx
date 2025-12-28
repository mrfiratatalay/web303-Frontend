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
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getAttendanceAnalytics, exportAnalytics, extractData } from '../../services/analyticsApi';
import { AttendanceAnalytics } from '../../types/analytics';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';

const AttendanceAnalyticsPage = () => {
    const [data, setData] = useState<AttendanceAnalytics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getAttendanceAnalytics();
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
            const response = await exportAnalytics('attendance', format);
            const blob = new Blob([response.data], {
                type: format === 'csv' ? 'text/csv' : 'application/json',
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `attendance-analytics.${format}`;
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

    // Prepare chart data from backend response
    const courseChartData = data?.attendanceByCourse?.map(item => ({
        name: `${item.section?.course?.code || 'N/A'} - ${item.section?.section_number || ''}`,
        sessions: item.totalSessions,
    })) || [];

    const trendChartData = data?.attendanceTrends?.map(item => ({
        date: new Date(item.date).toLocaleDateString('tr-TR'),
        sessions: item.sessionsCount,
    })) || [];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" gutterBottom>
                        Yoklama Analizi
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Devam oranları ve yoklama istatistikleri
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
                <EmptyState title="Veri Bulunamadı" message="Yoklama analiz verileri bulunamadı." />
            )}

            {data && (
                <>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Toplam Ders
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="primary.main">
                                    {data.attendanceByCourse?.length ?? 0}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Kritik Devamsızlık
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="error.main">
                                    {data.criticalAbsences?.length ?? 0}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Düşük Katılımlı Ders
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="warning.main">
                                    {data.lowAttendanceCourses?.length ?? 0}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Attendance Trends Chart */}
                    {trendChartData.length > 0 && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Son 30 Günlük Yoklama Trendi
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={trendChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="sessions" stroke="#1976d2" name="Oturum Sayısı" />
                                </LineChart>
                            </ResponsiveContainer>
                        </Paper>
                    )}

                    {/* Attendance by Course Chart */}
                    {courseChartData.length > 0 && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Derslere Göre Yoklama Oturumları
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={courseChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="sessions" fill="#82ca9d" name="Toplam Oturum" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    )}

                    {/* Attendance by Course Table */}
                    {data.attendanceByCourse && data.attendanceByCourse.length > 0 && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Derslere Göre Yoklama Detayları
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Ders Kodu</TableCell>
                                            <TableCell>Ders Adı</TableCell>
                                            <TableCell>Şube</TableCell>
                                            <TableCell align="right">Toplam Oturum</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.attendanceByCourse.map((item) => (
                                            <TableRow key={item.section_id}>
                                                <TableCell>
                                                    <Chip label={item.section?.course?.code || 'N/A'} size="small" color="primary" />
                                                </TableCell>
                                                <TableCell>{item.section?.course?.name || 'N/A'}</TableCell>
                                                <TableCell>{item.section?.section_number || '-'}</TableCell>
                                                <TableCell align="right">{item.totalSessions}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}

                    {/* Critical Absences Table */}
                    {data.criticalAbsences && data.criticalAbsences.length > 0 && (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom color="error.main">
                                Kritik Devamsızlık Yapan Öğrenciler
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Öğrenci No</TableCell>
                                            <TableCell>Ad Soyad</TableCell>
                                            <TableCell>E-posta</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.criticalAbsences.map((student) => (
                                            <TableRow key={student.id}>
                                                <TableCell>{student.student_number}</TableCell>
                                                <TableCell>
                                                    {student.user?.first_name} {student.user?.last_name}
                                                </TableCell>
                                                <TableCell>{student.user?.email}</TableCell>
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

export default AttendanceAnalyticsPage;
