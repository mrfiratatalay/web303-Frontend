import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
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
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Alert from '../../components/feedback/Alert';
import { extractData, getSectionStudents } from '../../services/enrollmentApi';
import { getErrorMessage } from '../../utils/error';

type StudentRow = {
  studentId?: string;
  studentNumber?: string;
  name?: string;
  email?: string;
};

function FacultySectionStudentsPage() {
  const [sectionId, setSectionId] = useState('');
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getSectionStudents(sectionId);
      const data = extractData<StudentRow[]>(response);
      setStudents(data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Öğrenciler alınamadı.'));
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Section Öğrencileri
      </Typography>
      {error && <Alert variant="error" message={error} />}

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Section ID"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={handleFetch} disabled={!sectionId || loading}>
              Listele
            </Button>
          </Stack>
        </CardContent>
      </Card>

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
                    <TableCell>No</TableCell>
                    <TableCell>Ad Soyad</TableCell>
                    <TableCell>E-posta</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((s, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{s.studentNumber}</TableCell>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                    </TableRow>
                  ))}
                  {!students.length && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
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

export default FacultySectionStudentsPage;
