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
import { useMealReservationQrCode } from '../../services/mealApi';
import { getErrorMessage } from '../../utils/error';

function MealQrUsePage() {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(true);
  const [lastScanned, setLastScanned] = useState('');
  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  const processQrCode = async (code: string) => {
    if (loading) return;
    if (code === lastScanned) return; // Prevent duplicate scans

    setLastScanned(code);
    setQrCode(code);
    setLoading(true);
    setError('');

    try {
      await useMealReservationQrCode(code.trim());
      setToast({ open: true, type: 'success', message: '✅ Yemek rezervasyonu kullanıldı!' });
      // Reset for next scan after a delay
      setTimeout(() => {
        setLastScanned('');
        setQrCode('');
      }, 3000);
    } catch (err) {
      const message = getErrorMessage(err, 'QR kullanımı başarısız.');
      setError(message);
      setToast({ open: true, type: 'error', message });
      // Allow retry after error
      setTimeout(() => setLastScanned(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!qrCode.trim()) {
      setError('QR kod gereklidir.');
      return;
    }
    await processQrCode(qrCode.trim());
  };

  const handleScan = (code: string) => {
    processQrCode(code);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        🍽️ Yemek QR Kullan
      </Typography>

      {error && <Alert variant="error" message={error} />}
      <Toast
        open={toast.open}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        type={toast.type}
        message={toast.message}
      />

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

      {toast.type === 'success' && toast.open && (
        <Card sx={{ bgcolor: 'success.light' }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
              <Typography fontWeight={600} color="success.dark">
                Yemek başarıyla verildi!
              </Typography>
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
                Öğrencinin yemek QR kodunu kameraya göstermesini isteyin
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
                ⌨️ Elle QR Kod Girişi
              </Typography>
              <TextField
                fullWidth
                label="QR kod"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="QR kodunu buraya yapıştırın"
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              />
              <Box>
                <Button variant="contained" onClick={handleManualSubmit} disabled={loading}>
                  {loading ? <LoadingSpinner label="Gönderiliyor..." /> : 'Gönder'}
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
            1. Öğrenciden yemek rezervasyon QR kodunu göstermesini isteyin
            <br />
            2. Kamerayı QR koda tutun veya kodu elle girin
            <br />
            3. Sistem otomatik olarak rezervasyonu kullanılmış olarak işaretler
            <br />
            4. Başarılı mesajı gördükten sonra öğrenci yemeğini alabilir
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default MealQrUsePage;
