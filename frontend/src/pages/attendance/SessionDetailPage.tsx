import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Button,
} from '@mui/material';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Alert from '../../components/feedback/Alert';
import { AttendanceSession } from '../../types/academics';
import { extractData, getSession } from '../../services/attendanceApi';
import { getErrorMessage } from '../../utils/error';

function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const response = await getSession(id);
        const data = extractData<AttendanceSession>(response);
        setSession(data);
      } catch (err) {
        setError(getErrorMessage(err, 'Oturum yüklenemedi.'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <Box py={4}>
        <LoadingSpinner label="Yükleniyor..." />
      </Box>
    );
  }

  if (error || !session) {
    return <Alert variant="error" message={error || 'Oturum bulunamadı.'} />;
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight={800}>
          Oturum Detay
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Geri
        </Button>
      </Stack>
      <Card>
        <CardContent>
          <Typography>Section: {session.section?.course?.code} / {session.section?.section_number}</Typography>
          <Typography>Durum: {session.status}</Typography>
          <Typography>Tarih: {session.date} {session.start_time}</Typography>
          <Typography>QR: {session.qr_code}</Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" mb={1}>
            Yoklama Kayıtları
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Öğrenci</TableCell>
                  <TableCell>Check-in</TableCell>
                  <TableCell>Mesafe (m)</TableCell>
                  <TableCell>Flag</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {session.records?.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.student_id}</TableCell>
                    <TableCell>{r.check_in_time}</TableCell>
                    <TableCell>{r.distance_from_center?.toFixed(2)}</TableCell>
                    <TableCell>{r.is_flagged ? r.flag_reason || 'Şüpheli' : '—'}</TableCell>
                  </TableRow>
                ))}
                {!session.records?.length && (
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
    </Stack>
  );
}

export default SessionDetailPage;
