import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Toast from '../../components/feedback/Toast';
import QRScanner from '../../components/qrcode/QRScanner';
import { checkInByQrCode, checkInRegistration } from '../../services/eventApi';
import { getErrorMessage } from '../../utils/error';

function EventCheckInPage() {
  const [qrCode, setQrCode] = useState('');
  const [eventId, setEventId] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(true);
  const [lastScanned, setLastScanned] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ name?: string } | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; type?: 'success' | 'info' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  });

  const processQrCode = async (code: string) => {
    if (loading) return;
    if (code === lastScanned) return; // Prevent duplicate scans

    setLastScanned(code);
    setQrCode(code);
    setLoading(true);
    setError('');
    setSuccessInfo(null);

    try {
      await checkInByQrCode(code.trim());
      setSuccessInfo({ name: 'Katılımcı' });
      setToast({ open: true, message: '✅ Check-in başarılı!', type: 'success' });
      // Reset for next scan after a delay
      setTimeout(() => {
        setLastScanned('');
        setQrCode('');
        setSuccessInfo(null);
      }, 3000);
    } catch (err) {
      const message = getErrorMessage(err, 'Check-in başarısız.');
      setError(message);
      setToast({ open: true, type: 'error', message });
      // Allow retry after error
      setTimeout(() => setLastScanned(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleQrCheckIn = async () => {
    if (!qrCode.trim()) {
      setError('QR kod gerekli.');
      return;
    }
    await processQrCode(qrCode.trim());
  };

  const handleScan = (code: string) => {
    processQrCode(code);
  };

  const handleManualCheckIn = async () => {
    if (!eventId.trim() || !registrationId.trim()) {
      setError('Etkinlik ID ve kayıt ID gerekli.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await checkInRegistration(eventId.trim(), registrationId.trim());
      setToast({ open: true, message: '✅ Check-in başarılı.', type: 'success' });
      setEventId('');
      setRegistrationId('');
    } catch (err) {
      setError(getErrorMessage(err, 'Check-in başarısız.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        🎫 Etkinlik Check-in
      </Typography>

      {error && <Alert variant="error" message={error} />}

      {/* Success indicator */}
      {loading && (
        <Card sx={{ bgcolor: 'info.light' }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <LoadingSpinner />
              <Typography fontWeight={600}>İşleniyor: {qrCode}</Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {successInfo && (
        <Card sx={{ bgcolor: 'success.light' }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
              <Box>
                <Typography fontWeight={600} color="success.dark">
                  Giriş Başarılı!
                </Typography>
                <Typography variant="body2" color="success.dark">
                  Katılımcı etkinliğe giriş yaptı
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Toggle buttons */}
      <Stack direction="row" spacing={1}>
        <Button
          variant={showScanner ? 'contained' : 'outlined'}
          startIcon={<CameraAltIcon />}
          onClick={() => setShowScanner(true)}
        >
          Kamera ile Tara
        </Button>
        <Button
          variant={!showScanner ? 'contained' : 'outlined'}
          startIcon={<KeyboardIcon />}
          onClick={() => setShowScanner(false)}
        >
          Elle Giriş
        </Button>
      </Stack>

      {/* Camera Scanner */}
      <Collapse in={showScanner}>
        <Card>
          <CardContent>
            <Stack spacing={2} alignItems="center">
              <Typography variant="subtitle1" fontWeight={700}>
                📷 Kamera ile QR Tarama
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Katılımcının etkinlik kayıt QR kodunu kameraya göstermesini isteyin
              </Typography>
              <QRScanner onScan={handleScan} width={320} height={320} />
            </Stack>
          </CardContent>
        </Card>
      </Collapse>

      {/* Manual Entry */}
      <Collapse in={!showScanner}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={700}>
                ⌨️ QR Kod ile Check-in
              </Typography>
              <TextField
                fullWidth
                label="QR kod"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="QR kodunu buraya yapıştırın"
                onKeyDown={(e) => e.key === 'Enter' && handleQrCheckIn()}
              />
              <Box>
                <Button variant="contained" onClick={handleQrCheckIn} disabled={loading}>
                  {loading ? <LoadingSpinner label="Check-in yapılıyor..." /> : 'Check-in'}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Divider sx={{ my: 2 }} />

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={700}>
                📝 Manuel Check-in
              </Typography>
              <TextField
                fullWidth
                label="Etkinlik ID"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
              />
              <TextField
                fullWidth
                label="Kayıt ID"
                value={registrationId}
                onChange={(e) => setRegistrationId(e.target.value)}
              />
              <Box>
                <Button variant="outlined" onClick={handleManualCheckIn} disabled={loading}>
                  {loading ? <LoadingSpinner label="Check-in yapılıyor..." /> : 'Manuel Check-in'}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Collapse>

      <Divider />

      {/* Instructions */}
      <Card sx={{ bgcolor: 'grey.50' }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            📋 Kullanım Talimatları
          </Typography>
          <Typography variant="body2" color="text.secondary">
            1. Katılımcıdan etkinlik kayıt QR kodunu göstermesini isteyin
            <br />
            2. Kamerayı QR koda tutun veya kodu elle girin
            <br />
            3. Sistem otomatik olarak katılımcıyı check-in yapar
            <br />
            4. Yeşil onay mesajı gördükten sonra katılımcı etkinliğe girebilir
          </Typography>
        </CardContent>
      </Card>

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </Stack>
  );
}

export default EventCheckInPage;
