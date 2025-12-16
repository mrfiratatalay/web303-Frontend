import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useEffect, useMemo, useState } from 'react';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { getCourses, normalizeCourseListResponse } from '../../services/courseApi';
import { addSectionStudent, extractData, getSectionStudents, removeSectionStudent } from '../../services/enrollmentApi';
import { getSections } from '../../services/sectionApi';
import { getUsers } from '../../services/userApi';
import { Course, Section } from '../../types/academics';
import { User } from '../../types/auth';
import { getErrorMessage } from '../../utils/error';

 type StudentRow = {
  enrollmentId?: string;
  studentId?: string;
  studentNumber?: string;
  name?: string;
  email?: string;
  status?: string;
};

 type SectionOption = {
  id: string;
  label: string;
  section_number: string;
  semester?: Section['semester'];
  year?: number;
  course?: Course;
};

function FacultySectionStudentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [sections, setSections] = useState<SectionOption[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);

  const [courseId, setCourseId] = useState('');
  const [semester, setSemester] = useState<Section['semester'] | ''>('');
  const [year, setYear] = useState<number | ''>('');
  const [sectionId, setSectionId] = useState('');

  const [loading, setLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [error, setError] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentOptions, setStudentOptions] = useState<User[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await getCourses({ limit: 100 });
        const data = normalizeCourseListResponse(response, { limit: 100 });
        setCourses(data.courses || []);
      } catch (err) {
        // non-blocking
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    const loadSections = async () => {
      if (!courseId) {
        setSections([]);
        setSectionId('');
        return;
      }
      setSectionsLoading(true);
      setError('');
      try {
        const params: Record<string, unknown> = { course_id: courseId, limit: 100 };
        if (semester) params.semester = semester;
        if (year) params.year = year;

        const response = await getSections(params);
        const data = extractData<{ sections?: Section[] }>(response);
        const mapped = (data.sections || []).map((s) => ({
          id: s.id,
          label: `${s.section_number}${s.semester ? ` - ${s.semester.toUpperCase()}` : ''}${s.year ? ` ${s.year}` : ''}`,
          section_number: s.section_number,
          semester: s.semester,
          year: s.year,
          course: s.course,
        }));
        setSections(mapped);
      } catch (err) {
        setError(getErrorMessage(err, 'Şubeler yüklenemedi.'));
        setSections([]);
      } finally {
        setSectionsLoading(false);
      }
    };
    loadSections();
  }, [courseId, semester, year]);

  const handleFetchStudents = async (id: string | number) => {
    const sectionKey = String(id || '');
    if (!sectionKey) return;
    setLoading(true);
    setError('');
    try {
      const response = await getSectionStudents(sectionKey);
      const data = extractData<StudentRow[]>(response);
      setStudents(data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Öğrenciler alınamadı.'));
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!sectionId || !selectedStudentId) return;
    setAddLoading(true);
    try {
      await addSectionStudent(String(sectionId), selectedStudentId);
      setAddOpen(false);
      setSelectedStudentId('');
      await handleFetchStudents(String(sectionId));
    } catch (err) {
      setError(getErrorMessage(err, 'Öğrenci eklenemedi.'));
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemove = async (studentId?: string) => {
    if (!sectionId || !studentId) return;
    setLoading(true);
    try {
      await removeSectionStudent(String(sectionId), studentId);
      await handleFetchStudents(String(sectionId));
    } catch (err) {
      setError(getErrorMessage(err, 'Öğrenci çıkarılamadı.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchStudents = async (query: string) => {
    setStudentSearch(query);
    if (!query.trim()) {
      setStudentOptions([]);
      return;
    }
    try {
      const response = await getUsers({ role: 'student', search: query.trim(), limit: 20 });
      const data = response.data?.data?.users || response.data?.users || [];
      setStudentOptions(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Öğrenci listesi alınamadı.'));
    }
  };

  const selectedSection = useMemo(() => sections.find((s) => s.id === sectionId) || null, [sections, sectionId]);
  const isReadyToList = !!sectionId;

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={800}>
          Şube Öğrencileri
        </Typography>
        {selectedSection && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => handleFetchStudents(sectionId)}
            disabled={loading}
          >
            Yenile
          </Button>
        )}
      </Stack>

      {error && <Alert variant="error" message={error} />}

      <Card>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Ders"
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setSectionId('');
                  setStudents([]);
                }}
                required
              >
                <MenuItem value="">
                  <em>Ders seçin</em>
                </MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                select
                fullWidth
                label="Dönem"
                value={semester}
                onChange={(e) => {
                  setSemester(e.target.value as Section['semester'] | '');
                  setSectionId('');
                  setStudents([]);
                }}
              >
                <MenuItem value="">
                  <em>Tüm dönemler</em>
                </MenuItem>
                <MenuItem value="fall">Güz</MenuItem>
                <MenuItem value="spring">Bahar</MenuItem>
                <MenuItem value="summer">Yaz</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                type="number"
                label="Yıl"
                value={year}
                onChange={(e) => {
                  const val = e.target.value;
                  setYear(val === '' ? '' : Number(val));
                  setSectionId('');
                  setStudents([]);
                }}
                placeholder="Tümü"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={sections}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                loading={sectionsLoading}
                value={selectedSection}
                onChange={(_, value) => {
                  const nextId = value?.id ? String(value.id) : '';
                  setSectionId(nextId);
                  setStudents([]);
                  if (nextId) handleFetchStudents(nextId);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Şube"
                    placeholder="Şube seçin"
                    helperText={courseId ? '' : 'Önce ders seçin'}
                  />
                )}
                disabled={!courseId}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {!isReadyToList ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">Lütfen bir şube seçin.</Typography>
          </CardContent>
        </Card>
      ) : loading ? (
        <Box py={4} display="flex" justifyContent="center">
          <LoadingSpinner label="Yükleniyor..." />
        </Box>
      ) : (
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle1" fontWeight={700}>
                  Öğrenciler
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {students.length} öğrenci
                </Typography>
              </Stack>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setAddOpen(true)}
                disabled={!sectionId}
              >
                Öğrenci Ekle
              </Button>
            </Stack>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>Ad Soyad</TableCell>
                    <TableCell>E-posta</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell align="right">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((s, idx) => (
                    <TableRow key={`${s.studentId || idx}`}>
                      <TableCell>{s.studentNumber || '-'}</TableCell>
                      <TableCell>{s.name || '-'}</TableCell>
                      <TableCell>{s.email || '-'}</TableCell>
                      <TableCell>{s.status || '-'}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleRemove(s.studentId)} disabled={loading} aria-label="Kayıttan çıkar">
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!students.length && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">Bu şubeye kayıtlı öğrenci yok.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Öğrenci Ekle</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={studentOptions}
            getOptionLabel={(option) => `${option.first_name || ''} ${option.last_name || ''}`.trim() || option.email || 'Öğrenci'}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={studentOptions.find((s) => s.id === selectedStudentId) || null}
            onChange={(_, value) => setSelectedStudentId(value?.id || '')}
            onInputChange={(_, value) => handleSearchStudents(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Öğrenci ara"
                placeholder="İsim, e-posta veya numara"
                helperText={studentSearch && !studentOptions.length ? 'Sonuç bulunamadı' : ''}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)} disabled={addLoading}>
            İptal
          </Button>
          <Button onClick={handleAdd} variant="contained" disabled={!selectedStudentId || addLoading}>
            {addLoading ? <LoadingSpinner label="Ekleniyor..." /> : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default FacultySectionStudentsPage;
