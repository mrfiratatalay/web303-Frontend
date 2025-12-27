import { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Paper,
    CircularProgress,
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
import { getAcademicPerformance, exportAnalytics, extractData } from '../../services/analyticsApi';
import { AcademicPerformance } from '../../types/analytics';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';

const AcademicAnalyticsPage = () => {
    const [data, setData] = useState<AcademicPerformance | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getAcademicPerformance();
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
            const response = await exportAnalytics('academic', format);
            const blob = new Blob([response.data], {
                type: format === 'csv' ? 'text/csv' : 'application/json',
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `academic-analytics.${format}`;
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
                        Akademik Performans Analizi
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        GPA dağılımı, not ortalamaları ve başarılı öğrenciler
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
                <EmptyState title="Veri Bulunamadı" message="Akademik performans verileri bulunamadı." />
            )}

            {data && (
                <>
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Ortalama GPA
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="primary.main">
                                    {data.overallStats.averageGPA.toFixed(2)}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Ortalama CGPA
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="secondary.main">
                                    {data.overallStats.averageCGPA.toFixed(2)}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Toplam Öğrenci
                                </Typography>
                                <Typography variant="h3" fontWeight="bold">
                                    {data.overallStats.totalStudents}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Geçme Oranı
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="success.main">
                                    {data.overallStats.passingRate.toFixed(1)}%
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Not Dağılımı
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.gradeDistribution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="grade" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#1976d2" name="Öğrenci Sayısı" />
                                <Bar dataKey="percentage" fill="#82ca9d" name="Yüzde (%)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            En Başarılı Öğrenciler
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Ad Soyad</TableCell>
                                        <TableCell>E-posta</TableCell>
                                        <TableCell align="right">GPA</TableCell>
                                        <TableCell align="right">CGPA</TableCell>
                                        <TableCell align="right">Toplam Kredi</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.topStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                {student.firstName} {student.lastName}
                                            </TableCell>
                                            <TableCell>{student.email}</TableCell>
                                            <TableCell align="right">{student.gpa.toFixed(2)}</TableCell>
                                            <TableCell align="right">{student.cgpa.toFixed(2)}</TableCell>
                                            <TableCell align="right">{student.totalCredits}</TableCell>
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

export default AcademicAnalyticsPage;
