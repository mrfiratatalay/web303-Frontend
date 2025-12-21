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
import { checkIn, getMyActiveSessions, extractData, ActiveSession } from '../../services/attendanceApi';
import { getErrorMessage } from '../../utils/error';

function StudentCheckInPage() {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [location, setLocation] = useState<{ latitude?: number; longitude?: number; accuracy?: number }>({});
  const [locationLoading, setLocationLoading] = useState(false);

  const loadSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMyActiveSessions();
      const data = extractData<ActiveSession[]>(response);
      setSessions(data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Aktif oturumlar yüklenemedi.'));
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setError('Tarayıcı konum erişimini desteklemiyor.');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setLocationLoading(false);
      },
      (err) => {
        setError(err.message);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleCheckIn = async (session: ActiveSession) => {
    if (!location.latitude || !location.longitude) {
      setError('Önce konumunuzu alın.');
      return;
    }
    setCheckingIn(session.id);
    setError('');
    setMessage('');
    try {
      await checkIn(session.id, {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        qr_code: session.qr_code,
      });
      setMessage(`${session.course.code} dersi için yoklamanız alındı!`);
      loadSessions(); // Refresh to update already_checked_in status
    } catch (err) {
      setError(getErrorMessage(err, 'Yoklama verilemedi.'));
    } finally {
      setCheckingIn(null);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Yoklama Ver
      </Typography>
      {message && <Alert variant="success" message={message} />}
      {error && <Alert variant="error" message={error} />}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={700}>
              Konum Bilgisi
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button variant="outlined" onClick={fetchLocation} disabled={locationLoading}>
                {locationLoading ? 'Konum alınıyor...' : 'Konum Al'}
              </Button>
              <Typography variant="body2" color="text.secondary">
                {location.latitude
                  ? `📍 Enlem: ${location.latitude.toFixed(5)}, Boylam: ${location.longitude?.toFixed(5)}, Doğruluk: ${Math.round(location.accuracy || 0)
                  }m`
                  : 'Konum alınmadı - Yoklama vermek için önce konum alın'}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Aktif Yoklama Oturumları
          </Typography>
          {loading ? (
            <Box py={4} textAlign="center">
              <LoadingSpinner label="Aktif oturumlar yükleniyor..." />
            </Box>
          ) : sessions.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>
              Şu anda kayıtlı olduğunuz derslerde açık yoklama oturumu bulunmuyor.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ders</TableCell>
                    <TableCell>Şube</TableCell>
                    <TableCell>Eğitmen</TableCell>
                    <TableCell>Tarih / Saat</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell align="right">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <Typography fontWeight={600}>{session.course.code}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {session.course.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{session.section_number}</TableCell>
                      <TableCell>{session.instructor || '-'}</TableCell>
                      <TableCell>
                        {session.date} {session.start_time}
                      </TableCell>
                      <TableCell>
                        {session.already_checked_in ? (
                          <Chip label="Yoklama Verildi" color="success" size="small" />
                        ) : (
                          <Chip label="Bekliyor" color="warning" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {session.already_checked_in ? (
                          <Typography variant="body2" color="success.main">
                            ✓ Tamamlandı
                          </Typography>
                        ) : (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleCheckIn(session)}
                            disabled={checkingIn === session.id || !location.latitude}
                          >
                            {checkingIn === session.id ? 'Gönderiliyor...' : 'Yoklama Ver'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Box mt={2}>
            <Button variant="text" onClick={loadSessions} disabled={loading}>
              🔄 Yenile
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default StudentCheckInPage;
