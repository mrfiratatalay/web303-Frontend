import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Toast from '../../components/feedback/Toast';
import { checkInByQrCode, checkInRegistration } from '../../services/eventApi';
import { getErrorMessage } from '../../utils/error';

function EventCheckInPage() {
  const [qrCode, setQrCode] = useState('');
  const [eventId, setEventId] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ open: boolean; message: string; type?: 'success' | 'info' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  });

  const handleQrCheckIn = async () => {
    if (!qrCode.trim()) {
      setError('QR kod gerekli.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await checkInByQrCode(qrCode.trim());
      setToast({ open: true, message: 'Check-in basarili.', type: 'success' });
      setQrCode('');
    } catch (err) {
      setError(getErrorMessage(err, 'Check-in basarisiz.'));
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async () => {
    if (!eventId.trim() || !registrationId.trim()) {
      setError('Etkinlik ID ve kayit ID gerekli.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await checkInRegistration(eventId.trim(), registrationId.trim());
      setToast({ open: true, message: 'Check-in basarili.', type: 'success' });
      setEventId('');
      setRegistrationId('');
    } catch (err) {
      setError(getErrorMessage(err, 'Check-in basarisiz.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Etkinlik check-in
      </Typography>

      {error && <Alert variant="error" message={error} />}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={700}>
              QR check-in
            </Typography>
            <TextField
              fullWidth
              label="QR kod"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="QR kodu taratin veya yapistirin"
            />
            <Box>
              <Button variant="contained" onClick={handleQrCheckIn} disabled={loading}>
                {loading ? <LoadingSpinner label="Check-in yapiliyor..." /> : 'Check-in'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={700}>
              Manuel check-in
            </Typography>
            <TextField
              fullWidth
              label="Etkinlik ID"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            />
            <TextField
              fullWidth
              label="Kayit ID"
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value)}
            />
            <Box>
              <Button variant="outlined" onClick={handleManualCheckIn} disabled={loading}>
                {loading ? <LoadingSpinner label="Check-in yapiliyor..." /> : 'Check-in'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, open: false }))} />
    </Stack>
  );
}

export default EventCheckInPage;
