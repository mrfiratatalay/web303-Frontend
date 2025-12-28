import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import QRScanner from '../../components/qrcode/QRScanner';
import LocationMap from '../../components/map/LocationMap';
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
  const [showQrModal, setShowQrModal] = useState(false);
  const [scannedQrCode, setScannedQrCode] = useState('');
  const [manualQrCode, setManualQrCode] = useState('');
  const [qrTabIndex, setQrTabIndex] = useState(0); // 0: Kamera, 1: Elle Giriş

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
        setMessage('📍 Konum başarıyla alındı!');
      },
      (err) => {
        setError(err.message);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleCheckIn = async (session: ActiveSession, qrCode?: string) => {
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
        qr_code: qrCode || session.qr_code,
      });
      setMessage(`✅ ${session.course.code} dersi için yoklamanız alındı!`);
      setShowQrModal(false);
      setManualQrCode('');
      loadSessions(); // Refresh to update already_checked_in status
    } catch (err) {
      setError(getErrorMessage(err, 'Yoklama verilemedi.'));
    } finally {
      setCheckingIn(null);
    }
  };

  const processQrCode = (code: string) => {
    setScannedQrCode(code);

    // Check if there are any active sessions
    if (sessions.length === 0) {
      setError('Kayıtlı olduğunuz derslerde aktif yoklama oturumu bulunmuyor.');
      return;
    }

    // Find matching session by QR code
    const matchingSession = sessions.find((s) => s.qr_code === code);
    if (matchingSession) {
      if (matchingSession.already_checked_in) {
        setError('Bu ders için zaten yoklama verdiniz.');
        return;
      }
      // Auto check-in with scanned QR
      handleCheckIn(matchingSession, code);
    } else {
      // QR doesn't match any enrolled course's session
      setError(
        'Bu QR kod kayıtlı olduğunuz derslerden birine ait değil. ' +
        'Bu derse kayıtlı olduğunuzdan emin olun veya doğru QR kodu taradığınızı kontrol edin.'
      );
    }
  };

  const handleQrScan = (code: string) => {
    processQrCode(code);
  };

  const handleManualQrSubmit = () => {
    if (!manualQrCode.trim()) {
      setError('QR kodu giriniz.');
      return;
    }
    processQrCode(manualQrCode.trim());
  };

  const pendingSessions = sessions.filter((s) => !s.already_checked_in);
  const completedSessions = sessions.filter((s) => s.already_checked_in);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        📋 Yoklama Ver
      </Typography>
      {message && <Alert variant="success" message={message} />}
      {error && <Alert variant="error" message={error} />}

      {/* Quick Actions with Map */}
      <Card sx={{ bgcolor: 'primary.50' }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={700}>
              🚀 Hızlı Yoklama
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Yoklama vermek için önce konumunuzu alın, sonra QR tarayın veya ders listesinden seçin.
            </Typography>

            {/* Location Map */}
            <LocationMap
              location={location.latitude && location.longitude ? {
                latitude: location.latitude,
                longitude: location.longitude,
                accuracy: location.accuracy,
              } : null}
              onLocationFetch={fetchLocation}
              loading={locationLoading}
              height={200}
              showAccuracyCircle={true}
            />

            {/* QR Button */}
            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<QrCodeScannerIcon />}
              onClick={() => setShowQrModal(true)}
              disabled={!location.latitude}
              fullWidth
              sx={{ py: 1.5 }}
            >
              {location.latitude ? '📱 QR ile Yoklama Ver' : 'Önce Konum Alın'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Pending Sessions */}
      {pendingSessions.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} mb={2} color="warning.main">
              ⏳ Bekleyen Yoklamalar ({pendingSessions.length})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ders</TableCell>
                    <TableCell>Şube</TableCell>
                    <TableCell>Saat</TableCell>
                    <TableCell align="right">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <Typography fontWeight={600}>{session.course.code}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {session.course.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{session.section_number}</TableCell>
                      <TableCell>{session.start_time}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleCheckIn(session)}
                          disabled={checkingIn === session.id || !location.latitude}
                          startIcon={checkingIn === session.id ? undefined : <CameraAltIcon />}
                        >
                          {checkingIn === session.id ? 'Gönderiliyor...' : 'Yoklama Ver'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Completed Sessions */}
      <Collapse in={completedSessions.length > 0}>
        <Card sx={{ bgcolor: 'success.50' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} mb={2} color="success.main">
              ✓ Tamamlanan Yoklamalar ({completedSessions.length})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ders</TableCell>
                    <TableCell>Şube</TableCell>
                    <TableCell>Saat</TableCell>
                    <TableCell>Durum</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {completedSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <Typography fontWeight={600}>{session.course.code}</Typography>
                      </TableCell>
                      <TableCell>{session.section_number}</TableCell>
                      <TableCell>{session.start_time}</TableCell>
                      <TableCell>
                        <Chip label="✓ Verildi" color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Collapse>

      {/* Empty State */}
      {!loading && sessions.length === 0 && (
        <Card>
          <CardContent>
            <Box py={4} textAlign="center">
              <Typography variant="h6" color="text.secondary" gutterBottom>
                📭 Aktif Yoklama Yok
              </Typography>
              <Typography color="text.secondary">
                Şu anda kayıtlı olduğunuz derslerde açık yoklama oturumu bulunmuyor.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Box py={4} textAlign="center">
          <LoadingSpinner label="Aktif oturumlar yükleniyor..." />
        </Box>
      )}

      {/* Refresh Button */}
      <Box>
        <Button variant="text" onClick={loadSessions} disabled={loading}>
          🔄 Yenile
        </Button>
      </Box>

      {/* QR Modal with Tabs */}
      <Dialog
        open={showQrModal}
        onClose={() => setShowQrModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>
            📱 QR ile Yoklama Ver
          </Typography>
          <IconButton onClick={() => setShowQrModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} py={1}>
            {/* Tabs for Camera / Manual Entry */}
            <Tabs
              value={qrTabIndex}
              onChange={(_, newValue) => setQrTabIndex(newValue)}
              variant="fullWidth"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab
                icon={<CameraAltIcon />}
                iconPosition="start"
                label="Kamera ile Tara"
              />
              <Tab
                icon={<KeyboardIcon />}
                iconPosition="start"
                label="Elle Gir"
              />
            </Tabs>

            {/* Tab 0: Camera Scanner */}
            {qrTabIndex === 0 && (
              <Stack spacing={2} alignItems="center" py={2}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Öğretmenin gösterdiği QR kodu kameranıza tutun.
                  <br />
                  QR tarandığında yoklamanız otomatik verilecek.
                </Typography>
                <QRScanner onScan={handleQrScan} width={300} height={300} />
                {scannedQrCode && (
                  <Typography variant="caption" color="text.secondary">
                    Son taranan: {scannedQrCode.substring(0, 8)}...
                  </Typography>
                )}
              </Stack>
            )}

            {/* Tab 1: Manual Entry */}
            {qrTabIndex === 1 && (
              <Stack spacing={2} py={2}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Öğretmenin gösterdiği QR kodunu elle girin.
                  <br />
                  (Kamera çalışmıyorsa bu seçeneği kullanın)
                </Typography>
                <TextField
                  fullWidth
                  label="QR Kodu"
                  placeholder="Örn: 550e8400-e29b-41d4-a716-446655440000"
                  value={manualQrCode}
                  onChange={(e) => setManualQrCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualQrSubmit()}
                  helperText="Öğretmenin ekranında görünen QR kod metnini buraya yapıştırın"
                />
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleManualQrSubmit}
                  disabled={!manualQrCode.trim() || checkingIn !== null}
                  startIcon={checkingIn ? undefined : <QrCodeScannerIcon />}
                >
                  {checkingIn ? 'Gönderiliyor...' : 'Yoklama Ver'}
                </Button>
              </Stack>
            )}

            <Divider />

            {/* Help Text */}
            <Box sx={{ bgcolor: 'info.50', p: 2, borderRadius: 1 }}>
              <Typography variant="caption" color="info.dark">
                💡 <strong>İpucu:</strong> Öğretmen QR kodunu projeksiyona yansıtır. 
                Kameranız çalışmıyorsa "Elle Gir" sekmesinden QR kod metnini yazabilirsiniz.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

export default StudentCheckInPage;
