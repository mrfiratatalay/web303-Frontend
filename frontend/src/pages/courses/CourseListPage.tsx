import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Alert from '../../components/feedback/Alert';
import { getCourses, normalizeCourseListResponse } from '../../services/courseApi';
import apiClient from '../../services/apiClient';
import { Course, CourseListQuery, CourseListResult, Department } from '../../types/academics';
import { getErrorMessage } from '../../utils/error';
import { useAuth } from '../../hooks/useAuth';

const DEFAULT_QUERY: CourseListQuery = {
  page: 1,
  limit: 10,
  sort_by: 'code',
  sort_order: 'ASC',
};

const unwrapDepartments = (response: unknown): Department[] => {
  if (Array.isArray(response)) return response;
  const typed = response as { data?: Department[] | { data?: Department[] } };
  if (Array.isArray(typed?.data)) return typed.data;
  if (Array.isArray((typed?.data as { data?: Department[] })?.data)) return (typed.data as { data: Department[] }).data;
  return [];
};

function CourseListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState<CourseListQuery>(DEFAULT_QUERY);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<CourseListResult['pagination'] | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await apiClient.get<Department[] | { data?: Department[] }>('/departments');
        setDepartments(unwrapDepartments(response.data as Department[] | { data?: Department[] }));
      } catch (err) {
        // non-blocking
      }
    };
    loadDepartments();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery((prev) => ({ ...prev, page: 1, search: searchInput.trim() || undefined }));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getCourses(query);
        const data = normalizeCourseListResponse(response, { page: query.page, limit: query.limit });
        setCourses(data.courses);
        setPagination(data.pagination || null);
      } catch (err) {
        setError(getErrorMessage(err, 'Dersler yüklenemedi.'));
        setCourses([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [query]);

  const handlePageChange = (_: unknown, newPage: number) => {
    setQuery((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleRowsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const limit = parseInt(event.target.value, 10);
    setQuery((prev) => ({ ...prev, page: 1, limit }));
  };

  const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setQuery((prev) => ({ ...prev, sort_by: event.target.value as CourseListQuery['sort_by'] }));
  };

  const handleOrderChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setQuery((prev) => ({ ...prev, sort_order: event.target.value as CourseListQuery['sort_order'] }));
  };

  const handleDepartmentChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    setQuery((prev) => ({ ...prev, page: 1, department_id: value || undefined }));
  };

  const adminActions = useMemo(() => {
    if (user?.role !== 'admin') return null;
    return (
      <Button
        variant="contained"
        size="small"
        onClick={() => navigate('/admin/courses/new')}
      >
        Yeni Ders
      </Button>
    );
  }, [navigate, user?.role]);

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight={800}>
          Dersler
        </Typography>
        {adminActions}
      </Stack>

      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Ara"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Kod veya isim"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="dept-filter-label">Bölüm</InputLabel>
                <Select
                  labelId="dept-filter-label"
                  label="Bölüm"
                  value={query.department_id || ''}
                  onChange={handleDepartmentChange}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="sort-by-label">Sırala</InputLabel>
                <Select
                  labelId="sort-by-label"
                  label="Sırala"
                  value={query.sort_by}
                  onChange={handleSortChange}
                >
                  <MenuItem value="code">Kod</MenuItem>
                  <MenuItem value="name">İsim</MenuItem>
                  <MenuItem value="credits">Kredi</MenuItem>
                  <MenuItem value="created_at">Oluşturulma</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="sort-order-label">Sıra</InputLabel>
                <Select
                  labelId="sort-order-label"
                  label="Sıra"
                  value={query.sort_order}
                  onChange={handleOrderChange}
                >
                  <MenuItem value="ASC">Artan</MenuItem>
                  <MenuItem value="DESC">Azalan</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button variant="outlined" size="small" onClick={() => setQuery(DEFAULT_QUERY)}>
                Sıfırla
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && <Alert variant="error" message={error} />}

      {loading ? (
        <Box py={4}>
          <LoadingSpinner label="Dersler yükleniyor..." />
        </Box>
      ) : (
        <Card>
          <CardHeader title="Ders Listesi" />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Kod</TableCell>
                    <TableCell>Ad</TableCell>
                    <TableCell>Kredi</TableCell>
                    <TableCell>ECTS</TableCell>
                    <TableCell>Bölüm</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow
                      key={course.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      <TableCell>
                        <Chip label={course.code} size="small" />
                      </TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.credits}</TableCell>
                      <TableCell>{course.ects}</TableCell>
                      <TableCell>{course.department?.name || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {!courses.length && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">Kayıt bulunamadı.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={pagination?.total || 0}
              page={(query.page || 1) - 1}
              onPageChange={handlePageChange}
              rowsPerPage={query.limit || 10}
              onRowsPerPageChange={handleRowsChange}
              rowsPerPageOptions={[5, 10, 20, 50]}
            />
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}

export default CourseListPage;
