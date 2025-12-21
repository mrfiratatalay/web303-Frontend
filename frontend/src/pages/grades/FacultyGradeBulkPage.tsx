import { useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { bulkEnterGrades } from '../../services/gradeApi';
import { getSectionStudents, extractData as extractEnrollmentData, SectionStudent } from '../../services/enrollmentApi';
import { getSections, extractData as extractSectionData } from '../../services/sectionApi';
import { Section } from '../../types/academics';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../utils/error';

// Weight constants
const MIDTERM_WEIGHT = 0.4; // 40%
const FINAL_WEIGHT = 0.6; // 60%

type StudentGrade = {
  enrollmentId: string;
  studentNumber: string;
  name: string;
  email: string;
  midterm: string;
  final: string;
};

const calculateOverall = (midterm: string, final: string): string => {
  const mid = parseFloat(midterm);
  const fin = parseFloat(final);
  if (isNaN(mid) || isNaN(fin)) return '-';
  const overall = mid * MIDTERM_WEIGHT + fin * FINAL_WEIGHT;
  return overall.toFixed(1);
};

const getLetterGrade = (overall: string): string => {
  const score = parseFloat(overall);
  if (isNaN(score)) return '-';
  if (score >= 90) return 'AA';
  if (score >= 85) return 'BA';
  if (score >= 80) return 'BB';
  if (score >= 75) return 'CB';
  if (score >= 70) return 'CC';
  if (score >= 65) return 'DC';
  if (score >= 60) return 'DD';
  if (score >= 50) return 'FD';
  return 'FF';
};

function FacultyGradeBulkPage() {
  const { user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load instructor's sections (admin sees all)
  useEffect(() => {
    const loadSections = async () => {
      if (!user?.id) return;
      setSectionsLoading(true);
      try {
        // Admin tüm dersleri görür, faculty sadece kendi derslerini
        const params = user.role === 'admin'
          ? { limit: 50 }
          : { instructor_id: user.id, limit: 50 };
        const response = await getSections(params);
        const data = extractSectionData(response);
        setSections(data?.sections || []);
      } catch (err) {
        console.warn('Şubeler yüklenemedi:', err);
      } finally {
        setSectionsLoading(false);
      }
    };
    loadSections();
  }, [user?.id, user?.role]);

  // Load students when section selected
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedSection) {
        setStudents([]);
        return;
      }
      setStudentsLoading(true);
      setError('');
      try {
        const response = await getSectionStudents(selectedSection.id);
        const data = extractEnrollmentData<SectionStudent[]>(response);
        setStudents(
          (data || []).map((s) => ({
            enrollmentId: s.enrollmentId || '',
            studentNumber: s.studentNumber || '',
            name: s.name || '',
            email: s.email || '',
            midterm: '',
            final: '',
          }))
        );
      } catch (err) {
        setError(getErrorMessage(err, 'Öğrenciler yüklenemedi.'));
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };
    loadStudents();
  }, [selectedSection]);

  const handleGradeChange = (enrollmentId: string, field: 'midterm' | 'final', value: string) => {
    // Validate 0-100
    if (value !== '' && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100)) {
      return;
    }
    setStudents((prev) =>
      prev.map((s) => (s.enrollmentId === enrollmentId ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = async () => {
    // Filter students with at least one grade
    const gradesToSubmit = students
      .filter((s) => s.midterm !== '' || s.final !== '')
      .map((s) => ({
        enrollment_id: s.enrollmentId,
        midterm_grade: s.midterm === '' ? null : Number(s.midterm),
        final_grade: s.final === '' ? null : Number(s.final),
      }));

    if (gradesToSubmit.length === 0) {
      setError('En az bir öğrenci için not girin.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');
    try {
      await bulkEnterGrades(gradesToSubmit);
      setMessage(`${gradesToSubmit.length} öğrenci için notlar kaydedildi.`);
    } catch (err) {
      setError(getErrorMessage(err, 'Notlar kaydedilemedi.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Toplu Not Girişi
      </Typography>
      {message && <Alert variant="success" message={message} />}
      {error && <Alert variant="error" message={error} />}

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Ders Seçin
          </Typography>
          <Autocomplete
            fullWidth
            options={sections}
            loading={sectionsLoading}
            getOptionLabel={(option) =>
              `${option.course?.code || option.course_id} / ${option.section_number} — ${option.course?.name || 'Şube'}`
            }
            value={selectedSection}
            onChange={(_, value) => setSelectedSection(value)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Şube"
                placeholder={sectionsLoading ? 'Şubeler yükleniyor...' : 'Şube seçin'}
              />
            )}
          />
        </CardContent>
      </Card>

      {selectedSection && (
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight={700}>
                {selectedSection.course?.code} - {selectedSection.course?.name} / Şube {selectedSection.section_number}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip label="Vize: %40" size="small" color="info" />
                <Chip label="Final: %60" size="small" color="info" />
              </Stack>
            </Stack>

            {studentsLoading ? (
              <Box py={4} textAlign="center">
                <LoadingSpinner label="Öğrenciler yükleniyor..." />
              </Box>
            ) : students.length === 0 ? (
              <Typography color="text.secondary">Bu derse kayıtlı öğrenci yok.</Typography>
            ) : (
              <>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Öğrenci No</TableCell>
                        <TableCell>Ad Soyad</TableCell>
                        <TableCell width={100}>Vize (0-100)</TableCell>
                        <TableCell width={100}>Final (0-100)</TableCell>
                        <TableCell width={80}>Genel Not</TableCell>
                        <TableCell width={60}>Harf</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.map((student) => {
                        const overall = calculateOverall(student.midterm, student.final);
                        const letter = getLetterGrade(overall);
                        return (
                          <TableRow key={student.enrollmentId}>
                            <TableCell>{student.studentNumber}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                inputProps={{ min: 0, max: 100 }}
                                value={student.midterm}
                                onChange={(e) => handleGradeChange(student.enrollmentId, 'midterm', e.target.value)}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                type="number"
                                inputProps={{ min: 0, max: 100 }}
                                value={student.final}
                                onChange={(e) => handleGradeChange(student.enrollmentId, 'final', e.target.value)}
                                sx={{ width: 80 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight={600}>{overall}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={letter}
                                size="small"
                                color={letter === 'FF' || letter === 'FD' ? 'error' : letter.startsWith('A') || letter.startsWith('B') ? 'success' : 'warning'}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box mt={2}>
                  <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                    {loading ? <LoadingSpinner label="Kaydediliyor..." /> : 'Notları Kaydet'}
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}

export default FacultyGradeBulkPage;
