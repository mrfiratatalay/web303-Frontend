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
import { AttendanceReport } from '../../types/academics';
import { extractData, getAttendanceReport } from '../../services/attendanceApi';
import { getErrorMessage } from '../../utils/error';

function AttendanceReportPage() {
  const [sectionId, setSectionId] = useState('');
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAttendanceReport(sectionId);
      const data = extractData<AttendanceReport>(response);
      setReport(data || null);
    } catch (err) {
      setError(getErrorMessage(err, 'Rapor alınamadı.'));
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Yoklama Raporu
      </Typography>
      {error && <Alert variant="error" message={error} />}

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField label="Şube ID" value={sectionId} onChange={(e) => setSectionId(e.target.value)} fullWidth />
            <Button variant="contained" onClick={handleFetch} disabled={!sectionId || loading}>
              Getir
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Box py={4}>
          <LoadingSpinner label="Yükleniyor..." />
        </Box>
      ) : report ? (
        <Card>
          <CardContent>
            <Typography mb={1}>
              Toplam oturum: {report.totalSessions ?? '-'} | Katılım: {report.attendanceRate ?? '-'}%
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Öğrenci</TableCell>
                    <TableCell>Numara</TableCell>
                    <TableCell>Katılım %</TableCell>
                    <TableCell>Devamsızlık</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(report.students) && report.students.length > 0 ? (
                    report.students.map((s, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.studentNumber}</TableCell>
                        <TableCell>{s.attendanceRate ?? '-'}%</TableCell>
                        <TableCell>{s.absences ?? '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary">Kayıt yok.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
}

export default AttendanceReportPage;

