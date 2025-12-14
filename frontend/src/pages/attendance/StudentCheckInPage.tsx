import { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { checkIn } from '../../services/attendanceApi';
import { getErrorMessage } from '../../utils/error';

function StudentCheckInPage() {
  const [sessionId, setSessionId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [location, setLocation] = useState<{ latitude?: number; longitude?: number; accuracy?: number }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setError('Tarayıcı konum erişimini desteklemiyor.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await checkIn(sessionId, {
        latitude: location.latitude || 0,
        longitude: location.longitude || 0,
        accuracy: location.accuracy,
        qr_code: qrCode || undefined,
      });
      setMessage('Yoklama verildi.');
    } catch (err) {
      setError(getErrorMessage(err, 'Yoklama verilemedi.'));
    } finally {
      setLoading(false);
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
            <TextField label="Session ID" value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
            <TextField label="QR Kod (isteğe bağlı)" value={qrCode} onChange={(e) => setQrCode(e.target.value)} />
            <Stack direction="row" spacing={2} alignItems="center">
              <Button variant="outlined" onClick={fetchLocation}>
                Konum Al
              </Button>
              <Typography variant="body2" color="text.secondary">
                {location.latitude
                  ? `Lat: ${location.latitude.toFixed(5)}, Lon: ${location.longitude?.toFixed(5)}, Acc: ${
                      location.accuracy ?? '-'
                    }`
                  : 'Konum alınmadı'}
              </Typography>
            </Stack>
            <Button variant="contained" onClick={handleSubmit} disabled={loading || !sessionId || !location.latitude}>
              {loading ? <LoadingSpinner label="Gönderiliyor..." /> : 'Gönder'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default StudentCheckInPage;
