import { useEffect, useState } from 'react';
import {
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
  Typography,
} from '@mui/material';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { Enrollment, EnrollmentQuery, EnrollmentStatus } from '../../types/academics';
import { dropCourse, getMyCourses, extractData } from '../../services/enrollmentApi';
import { getErrorMessage } from '../../utils/error';

const DEFAULT_QUERY: EnrollmentQuery = {};
const STATUS_LABELS: Record<EnrollmentStatus, string> = {
  enrolled: 'Kayıtlı',
  dropped: 'Bırakıldı',
  completed: 'Tamamlandı',
  failed: 'Kaldı',
  withdrawn: 'Çekildi',
};
const formatStatus = (status: EnrollmentStatus) => STATUS_LABELS[status] || status;

function StudentEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = async (params?: EnrollmentQuery) => {
    setLoading(true);
    setError('');
    try {
      const response = await getMyCourses(params);
      const data = extractData<Enrollment[]>(response);
      setEnrollments(data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Kayıtlar yüklenemedi.'));
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(DEFAULT_QUERY);
  }, []);

  const handleDrop = async (id: string) => {
    setMessage('');
    setError('');
    try {
      await dropCourse(id);
      setMessage('Ders bırakıldı.');
      loadData(DEFAULT_QUERY);
    } catch (err) {
      setError(getErrorMessage(err, 'Ders bırakılamadı.'));
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Kayıtlarım
      </Typography>
      {message && <Alert variant="success" message={message} />}
      {error && <Alert variant="error" message={error} />}

      {loading ? (
        <Box py={4}>
          <LoadingSpinner label="Yükleniyor..." />
        </Box>
      ) : (
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ders</TableCell>
                    <TableCell>Şube</TableCell>
                    <TableCell>Dönem</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell align="right">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrollments.map((enroll) => (
                    <TableRow key={enroll.id}>
                      <TableCell>{enroll.section?.course?.code || enroll.section_id}</TableCell>
                      <TableCell>{enroll.section?.section_number}</TableCell>
                      <TableCell>
                        {enroll.section?.semester} {enroll.section?.year}
                      </TableCell>
                      <TableCell>
                        <Chip label={formatStatus(enroll.status)} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        {enroll.status === 'enrolled' && (
                          <Button variant="outlined" size="small" onClick={() => handleDrop(enroll.id)}>
                            Bırak
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!enrollments.length && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">Kayıt bulunamadı.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}

export default StudentEnrollmentsPage;

