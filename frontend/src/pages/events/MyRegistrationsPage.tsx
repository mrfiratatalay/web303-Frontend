import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { QrCode2, Close } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Toast from '../../components/feedback/Toast';
import { cancelRegistration, extractData, getMyRegistrations } from '../../services/eventApi';
import { EventRegistration } from '../../types/events';
import { getErrorMessage } from '../../utils/error';

const statusTurkish: Record<string, string> = {
  registered: 'Kayıtlı',
  cancelled: 'İptal Edildi',
  checked_in: 'Katıldı',
  waitlisted: 'Bekleme Listesi',
};

function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedReg, setSelectedReg] = useState<EventRegistration | null>(null);
  const [toast, setToast] = useState<{ open: boolean; message: string; type?: 'success' | 'info' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  });

  const loadRegistrations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMyRegistrations();
      const data = extractData<EventRegistration[]>(response);
      setRegistrations(data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Kayitlar yuklenemedi.'));
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const handleCancel = async (registration: EventRegistration) => {
    if (!registration.event_id) return;
    setActionLoading(registration.id);
    setError('');
    try {
      await cancelRegistration(registration.event_id, registration.id);
      setToast({ open: true, message: 'Kayit iptal edildi.', type: 'success' });
      loadRegistrations();
    } catch (err) {
      setError(getErrorMessage(err, 'Iptal basarisiz.'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleShowQR = (reg: EventRegistration) => {
    setSelectedReg(reg);
    setQrModalOpen(true);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Etkinlik Kayıtlarım
      </Typography>

      {error && <Alert variant="error" message={error} />}

      {loading ? (
        <Box py={4}>
          <LoadingSpinner label="Kayitlar yukleniyor..." />
        </Box>
      ) : (
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Etkinlik</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>QR Kod</TableCell>
                    <TableCell align="right">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>
                        <Typography fontWeight={600}>{reg.event?.title || '-'}</Typography>
                        {reg.event?.id && (
                          <Button
                            size="small"
                            component={RouterLink}
                            to={`/events/${reg.event.id}`}
                          >
                            Detay
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {reg.event?.date
                          ? new Date(reg.event.date).toLocaleDateString('tr-TR')
                          : reg.event?.start_time || '-'}
                      </TableCell>
                      <TableCell>
                        <Typography
                          color={
                            reg.status === 'checked_in'
                              ? 'success.main'
                              : reg.status === 'cancelled'
                                ? 'error.main'
                                : 'text.primary'
                          }
                          fontWeight={500}
                        >
                          {statusTurkish[reg.status || 'registered'] || reg.status}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {reg.qr_code && reg.status !== 'cancelled' ? (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<QrCode2 />}
                            onClick={() => handleShowQR(reg)}
                          >
                            QR Göster
                          </Button>
                        ) : (
                          <Typography color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {reg.status !== 'cancelled' && reg.status !== 'checked_in' && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleCancel(reg)}
                            disabled={actionLoading === reg.id}
                          >
                            {actionLoading === reg.id ? 'İptal ediliyor...' : 'İptal Et'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!registrations.length && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">Kayit bulunamadi.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* QR Code Modal */}
      <Dialog open={qrModalOpen} onClose={() => setQrModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>
            Etkinlik Giriş QR Kodu
          </Typography>
          <IconButton onClick={() => setQrModalOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedReg && (
            <Stack spacing={2} alignItems="center" py={2}>
              <Typography variant="subtitle1" fontWeight={600}>
                {selectedReg.event?.title}
              </Typography>
              {selectedReg.qr_code && (
                <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #ddd' }}>
                  <QRCodeSVG value={selectedReg.qr_code} size={200} />
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" textAlign="center">
                Bu QR kodu etkinlik girişinde görevliye gösterin.
                <br />
                Kod: <strong>{selectedReg.qr_code}</strong>
              </Typography>
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, open: false }))} />
    </Stack>
  );
}

export default MyRegistrationsPage;

