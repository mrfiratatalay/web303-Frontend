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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getAcademicPerformance, exportAnalytics, extractData } from '../../services/analyticsApi';
import { AcademicPerformance } from '../../types/analytics';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

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

    // Chart data preparation
    const gradeChartData = data?.gradeDistribution?.map(g => ({
        grade: g.letter_grade,
        count: g.count
    })) || [];

    const passFailData = data ? [
        { name: 'Geçen', value: data.passRate, color: '#4caf50' },
        { name: 'Kalan', value: data.failRate, color: '#f44336' }
    ] : [];

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
                                    Geçme Oranı
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="success.main">
                                    {data.passRate?.toFixed(1) ?? 0}%
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Kalma Oranı
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="error.main">
                                    {data.failRate?.toFixed(1) ?? 0}%
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    En Başarılı Öğrenci Sayısı
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="primary.main">
                                    {data.topStudents?.length ?? 0}
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Risk Altındaki Öğrenci
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" color="warning.main">
                                    {data.atRiskStudents?.length ?? 0}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Not Dağılımı
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={gradeChartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="grade" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" fill="#1976d2" name="Öğrenci Sayısı" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Geçme/Kalma Oranı
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={passFailData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={(entry: any) => `${entry.name}: ${entry.value.toFixed(1)}%`}
                                            outerRadius={80}
                                            dataKey="value"
                                        >
                                            {passFailData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Top Students Table */}
                    {data.topStudents && data.topStudents.length > 0 && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                En Başarılı Öğrenciler (Top 10)
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Öğrenci No</TableCell>
                                            <TableCell>Ad Soyad</TableCell>
                                            <TableCell align="right">GPA</TableCell>
                                            <TableCell align="right">CGPA</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.topStudents.map((student) => (
                                            <TableRow key={student.id}>
                                                <TableCell>{student.student_number}</TableCell>
                                                <TableCell>
                                                    {student.user?.first_name} {student.user?.last_name}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={student.gpa?.toFixed(2)}
                                                        color="success"
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">{student.cgpa?.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}

                    {/* At Risk Students Table */}
                    {data.atRiskStudents && data.atRiskStudents.length > 0 && (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom color="warning.main">
                                Risk Altındaki Öğrenciler (GPA &lt; 2.0)
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Öğrenci No</TableCell>
                                            <TableCell>Ad Soyad</TableCell>
                                            <TableCell>E-posta</TableCell>
                                            <TableCell align="right">GPA</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.atRiskStudents.map((student) => (
                                            <TableRow key={student.id}>
                                                <TableCell>{student.student_number}</TableCell>
                                                <TableCell>
                                                    {student.user?.first_name} {student.user?.last_name}
                                                </TableCell>
                                                <TableCell>{student.user?.email}</TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={student.gpa?.toFixed(2)}
                                                        color="error"
                                                        size="small"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    )}

                    {/* GPA by Department */}
                    {data.gpaByDepartment && data.gpaByDepartment.length > 0 && (
                        <Paper sx={{ p: 3, mt: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Bölümlere Göre Ortalama GPA
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Bölüm ID</TableCell>
                                            <TableCell align="right">Ortalama GPA</TableCell>
                                            <TableCell align="right">Öğrenci Sayısı</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.gpaByDepartment.map((dept) => (
                                            <TableRow key={dept.department_id}>
                                                <TableCell>{dept.department_id}</TableCell>
                                                <TableCell align="right">{dept.averageGpa}</TableCell>
                                                <TableCell align="right">{dept.studentCount}</TableCell>
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

export default AcademicAnalyticsPage;
