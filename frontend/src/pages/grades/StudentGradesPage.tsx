import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Alert from '../../components/feedback/Alert';
import { GradeEntry } from '../../types/academics';
import { extractData, getMyGrades } from '../../services/gradeApi';
import { getErrorMessage } from '../../utils/error';

function StudentGradesPage() {
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getMyGrades();
        const data = extractData<GradeEntry[] | GradeEntry>(response);
        setGrades(Array.isArray(data) ? data : data ? [data] : []);
      } catch (err) {
        setError(getErrorMessage(err, 'Notlar yüklenemedi.'));
        setGrades([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Notlarım
      </Typography>
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
                    <TableCell>Vize</TableCell>
                    <TableCell>Final</TableCell>
                    <TableCell>Harf</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grades.map((g) => (
                    <TableRow key={g.enrollment_id}>
                      <TableCell>{g.section?.course?.code}</TableCell>
                      <TableCell>{g.section?.section_number}</TableCell>
                      <TableCell>{g.midterm_grade ?? '-'}</TableCell>
                      <TableCell>{g.final_grade ?? '-'}</TableCell>
                      <TableCell>{g.letter_grade ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                  {!grades.length && (
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

export default StudentGradesPage;

