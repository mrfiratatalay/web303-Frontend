import { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Toast from '../../components/feedback/Toast';
import { useMealReservationQrCode } from '../../services/mealApi';
import { getErrorMessage } from '../../utils/error';

function MealQrUsePage() {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  const handleSubmit = async () => {
    if (!qrCode.trim()) {
      setError('QR kod gereklidir.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await useMealReservationQrCode(qrCode.trim());
      setToast({ open: true, type: 'success', message: 'Rezervasyon kullanildi.' });
      setQrCode('');
    } catch (err) {
      const message = getErrorMessage(err, 'QR kullanımı başarısız.');
      setError(message);
      setToast({ open: true, type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Yemek QR kullan
      </Typography>

      {error && <Alert variant="error" message={error} />}
      <Toast open={toast.open} onClose={() => setToast((prev) => ({ ...prev, open: false }))} type={toast.type} message={toast.message} />

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="QR kod"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="QR kodu taratın veya yapıştırın"
            />
            <Box>
              <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                {loading ? <LoadingSpinner label="Gönderiliyor..." /> : 'Gönder'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default MealQrUsePage;
