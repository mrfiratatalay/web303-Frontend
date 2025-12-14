import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Alert from '../../components/feedback/Alert';
import { AttendanceSummary } from '../../types/academics';
import { extractData, getMyAttendance } from '../../services/attendanceApi';
import { getErrorMessage } from '../../utils/error';

function MyAttendancePage() {
  const [data, setData] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getMyAttendance();
        const payload = extractData<AttendanceSummary[]>(response);
        setData(payload || []);
      } catch (err) {
        setError(getErrorMessage(err, 'Yoklama bilgisi alınamadı.'));
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Yoklama Özeti
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
                    <TableCell>Section</TableCell>
                    <TableCell>Katılım %</TableCell>
                    <TableCell>Durum</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.courseCode}</TableCell>
                      <TableCell>{item.sectionNumber}</TableCell>
                      <TableCell>{item.attendanceRate}%</TableCell>
                      <TableCell>{item.status}</TableCell>
                    </TableRow>
                  ))}
                  {!data.length && (
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
      )}
    </Stack>
  );
}

export default MyAttendancePage;
