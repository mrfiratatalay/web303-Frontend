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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Toplam Oturum
                                </Typography>
                                <Typography variant="h3" fontWeight="bold">
                                    {data.overallStats.totalSessions}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Ortalama Devam
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="success.main">
                                    {data.overallStats.averageAttendanceRate.toFixed(1)}%
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Toplam Mazeret
                                </Typography>
                                <Typography variant="h3" fontWeight="bold">
                                    {data.overallStats.totalExcuses}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Onaylanan Mazeret
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="primary.main">
                                    {data.overallStats.approvedExcuses}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Şube Bazlı Devam Oranları
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.sectionAttendance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="courseCode" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="averageAttendanceRate" fill="#82ca9d" name="Devam Oranı (%)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>

                    {data.lowAttendanceStudents && data.lowAttendanceStudents.length > 0 && (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Düşük Devam Oranına Sahip Öğrenciler
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Öğrenci Adı</TableCell>
                                            <TableCell align="right">Devam Oranı</TableCell>
                                            <TableCell align="right">Toplam Devamsızlık</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.lowAttendanceStudents.map((student) => (
                                            <TableRow key={student.studentId}>
                                                <TableCell>{student.studentName}</TableCell>
                                                <TableCell align="right">
                                                    <Typography color="error.main">
                                                        {student.attendanceRate.toFixed(1)}%
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">{student.totalAbsences}</TableCell>
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
