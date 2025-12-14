import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
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
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Alert from '../../components/feedback/Alert';
import { Section, SectionListQuery, SectionListResult } from '../../types/academics';
import { getSections, extractData } from '../../services/sectionApi';
import { getErrorMessage } from '../../utils/error';
import { useAuth } from '../../hooks/useAuth';

const DEFAULT_QUERY: SectionListQuery = {
  page: 1,
  limit: 10,
  sort_by: 'course_id',
  sort_order: 'ASC',
};

function SectionListPage() {
  const [query, setQuery] = useState<SectionListQuery>(DEFAULT_QUERY);
  const [sections, setSections] = useState<Section[]>([]);
  const [pagination, setPagination] = useState<SectionListResult['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadSections = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getSections({
          ...query,
          course_id: courseFilter || undefined,
          semester: (semesterFilter as SectionListQuery['semester']) || undefined,
        });
        const data = extractData<SectionListResult>(response);
        setSections(data.sections || []);
        setPagination(data.pagination || null);
      } catch (err) {
        setError(getErrorMessage(err, 'Section listesi yüklenemedi.'));
        setSections([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };
    loadSections();
  }, [courseFilter, query, semesterFilter]);

  const handlePageChange = (_: unknown, newPage: number) => {
    setQuery((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleRowsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const limit = parseInt(event.target.value, 10);
    setQuery((prev) => ({ ...prev, page: 1, limit }));
  };

  const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setQuery((prev) => ({ ...prev, sort_by: event.target.value as SectionListQuery['sort_by'] }));
  };

  const handleOrderChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setQuery((prev) => ({ ...prev, sort_order: event.target.value as SectionListQuery['sort_order'] }));
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight={800}>
          Sectionlar
        </Typography>
        {user?.role === 'admin' && (
          <Button variant="contained" size="small" onClick={() => navigate('/admin/sections/new')}>
            Yeni Section
          </Button>
        )}
      </Stack>

      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Course ID filtresi"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="semester-label">Dönem</InputLabel>
                <Select
                  labelId="semester-label"
                  label="Dönem"
                  value={semesterFilter}
                  onChange={(e) => setSemesterFilter(e.target.value as string)}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="fall">Fall</MenuItem>
                  <MenuItem value="spring">Spring</MenuItem>
                  <MenuItem value="summer">Summer</MenuItem>
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
                  <MenuItem value="course_id">Course</MenuItem>
                  <MenuItem value="section_number">Section</MenuItem>
                  <MenuItem value="year">Yıl</MenuItem>
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
            <Grid item xs={12} md={2}>
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
          <LoadingSpinner label="Sectionlar yükleniyor..." />
        </Box>
      ) : (
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Course</TableCell>
                    <TableCell>Section</TableCell>
                    <TableCell>Dönem</TableCell>
                    <TableCell>Yıl</TableCell>
                    <TableCell>Kontenjan</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sections.map((section) => (
                    <TableRow
                      key={section.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/sections/${section.id}`)}
                    >
                      <TableCell>{section.course?.code || section.course_id}</TableCell>
                      <TableCell>{section.section_number}</TableCell>
                      <TableCell>{section.semester}</TableCell>
                      <TableCell>{section.year}</TableCell>
                      <TableCell>
                        {section.enrolled_count ?? '-'} / {section.capacity}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!sections.length && (
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

export default SectionListPage;
