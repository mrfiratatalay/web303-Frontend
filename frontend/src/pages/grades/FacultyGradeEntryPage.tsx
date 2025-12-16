import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { enterGrade } from '../../services/gradeApi';
import { getErrorMessage } from '../../utils/error';
import { getSectionStudents, extractData as extractEnrollmentData, SectionStudent } from '../../services/enrollmentApi';
import { getSections, extractData as extractSectionData } from '../../services/sectionApi';
import { Section } from '../../types/academics';

type GradeFieldState = {
  value: string;
  error?: string;
};

const gradeError = 'Notlar 0-100 aralığında olmalı.';

function FacultyGradeEntryPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  const [students, setStudents] = useState<SectionStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<SectionStudent | null>(null);

  const [midterm, setMidterm] = useState<GradeFieldState>({ value: '' });
  const [finalGrade, setFinalGrade] = useState<GradeFieldState>({ value: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSections = async () => {
      setSectionsLoading(true);
      try {
        const response = await getSections({ page: 1, limit: 100 });
        const data = extractSectionData(response);
        setSections(data.sections || []);
      } catch (err) {
        setError(getErrorMessage(err, 'Şubeler yüklenemedi.'));
      } finally {
        setSectionsLoading(false);
      }
    };

    fetchSections();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedSection) return;
      setStudents([]);
      setSelectedStudent(null);
      setStudentsLoading(true);
      try {
        const response = await getSectionStudents(selectedSection.id);
        const data = extractEnrollmentData(response);
        setStudents(data || []);
      } catch (err) {
        setError(getErrorMessage(err, 'Öğrenciler alınamadı.'));
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedSection]);

  const sectionOptions = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        label: `${section.course?.code || 'Ders'} / Şube ${section.section_number} • ${section.semester} ${section.year}`,
        description: section.course?.name || '',
      })),
    [sections],
  );

  const studentOptions = useMemo(
    () =>
      students.map((student) => ({
        ...student,
        label: `${student.name || 'Öğrenci'}${student.studentNumber ? ` • ${student.studentNumber}` : ''}${
          student.email ? ` • ${student.email}` : ''
        }`,
      })),
    [students],
  );

  const parseGrade = (value: string): number | null => {
    if (value === '') return null;
    const num = Number(value);
    if (Number.isNaN(num) || num < 0 || num > 100) {
      return NaN;
    }
    return num;
  };

  const handleSubmit = async () => {
    if (!selectedSection || !selectedStudent?.enrollmentId) {
      setFormError('Şube ve öğrenci seçin.');
      return;
    }

    const parsedMidterm = parseGrade(midterm.value);
    const parsedFinal = parseGrade(finalGrade.value);

    const hasInvalid = Number.isNaN(parsedMidterm) || Number.isNaN(parsedFinal);
    setMidterm((prev) => ({ ...prev, error: Number.isNaN(parsedMidterm) ? gradeError : undefined }));
    setFinalGrade((prev) => ({ ...prev, error: Number.isNaN(parsedFinal) ? gradeError : undefined }));

    if (hasInvalid) {
      setFormError(gradeError);
      return;
    }

    setFormError(null);
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await enterGrade({
        enrollment_id: selectedStudent.enrollmentId,
        midterm_grade: parsedMidterm,
        final_grade: parsedFinal,
      });
      setMessage('Not girildi.');
      setMidterm({ value: '' });
      setFinalGrade({ value: '' });
      setSelectedStudent(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Not girilemedi.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Not Girişi
      </Typography>
      {message && <Alert variant="success" message={message} />}
      {error && <Alert variant="error" message={error} />}
      {formError && <Alert variant="warning" message={formError} />}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Autocomplete
              options={sectionOptions}
              loading={sectionsLoading}
              getOptionLabel={(option) => option.label || ''}
              isOptionEqualToValue={(opt, val) => opt.id === val.id}
              onChange={(_, value) => setSelectedSection(value || null)}
              value={selectedSection}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Şube"
                  placeholder="Şube seçiniz"
                  helperText={selectedSection?.course?.name || ''}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {sectionsLoading ? <CircularProgress color="inherit" size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <Autocomplete
              options={studentOptions}
              loading={studentsLoading}
              getOptionLabel={(option) => option.label || ''}
              isOptionEqualToValue={(opt, val) => opt.enrollmentId === val.enrollmentId}
              onChange={(_, value) => setSelectedStudent(value || null)}
              value={selectedStudent}
              disabled={!selectedSection}
              noOptionsText={selectedSection ? 'Öğrenci bulunamadı' : 'Önce şube seçin'}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Öğrenci"
                  placeholder={selectedSection ? 'Öğrenci seçiniz' : 'Önce şube seçin'}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {studentsLoading ? <CircularProgress color="inherit" size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            <TextField
              label="Vize (0-100)"
              value={midterm.value}
              onChange={(e) => setMidterm({ value: e.target.value })}
              type="number"
              error={Boolean(midterm.error)}
              helperText={midterm.error || 'İsteğe bağlı'}
            />
            <TextField
              label="Final (0-100)"
              value={finalGrade.value}
              onChange={(e) => setFinalGrade({ value: e.target.value })}
              type="number"
              error={Boolean(finalGrade.error)}
              helperText={finalGrade.error || 'İsteğe bağlı'}
            />
            <Box>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !selectedSection || !selectedStudent?.enrollmentId}
              >
                {loading ? <LoadingSpinner label="Kaydediliyor..." /> : 'Kaydet'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default FacultyGradeEntryPage;
