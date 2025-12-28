import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import Toast from '../../components/feedback/Toast';
import QRCodeDisplay from '../../components/qrcode/QRCodeDisplay';
import { MealReservation } from '../../types/meals';
import { cancelMealReservation, extractData, getMyMealReservations } from '../../services/mealApi';
import { getErrorMessage } from '../../utils/error';

function MealReservationsPage() {
  const [reservations, setReservations] = useState<MealReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
  });
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<MealReservation | null>(null);

  const loadReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMyMealReservations();
      const data = extractData<MealReservation[] | MealReservation>(response);
      setReservations(Array.isArray(data) ? data : data ? [data] : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Rezervasyonlar yüklenemedi.'));
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const openCancelDialog = (reservation: MealReservation) => {
    setReservationToCancel(reservation);
    setCancelDialogOpen(true);
  };

  const closeCancelDialog = () => {
    setCancelDialogOpen(false);
    setReservationToCancel(null);
  };

  const handleConfirmCancel = async () => {
    if (!reservationToCancel) return;
    setActionId(reservationToCancel.id);
    setError('');
    try {
      await cancelMealReservation(reservationToCancel.id);
      setToast({ open: true, type: 'success', message: 'Rezervasyon iptal edildi.' });
      setReservations((prev) => prev.filter((item) => item.id !== reservationToCancel.id));
      closeCancelDialog();
    } catch (err) {
      const message = getErrorMessage(err, 'İptal başarısız.');
      setError(message);
      setToast({ open: true, type: 'error', message });
    } finally {
      setActionId(null);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Yemek Rezervasyonlarım
      </Typography>

      {error && <Alert variant="error" message={error} />}

      {loading ? (
        <Box py={4}>
          <LoadingSpinner label="Rezervasyonlar yükleniyor..." />
        </Box>
      ) : (
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Menu</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>QR</TableCell>
                    <TableCell align="right">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>{reservation.menu?.title || reservation.menu?.name || reservation.menu_id || '-'}</TableCell>
                      <TableCell>{reservation.menu?.date || reservation.reserved_at || '-'}</TableCell>
                      <TableCell>{reservation.status || '-'}</TableCell>
                      <TableCell>
                        {reservation.qr_code && reservation.status === 'reserved' ? (
                          <QRCodeDisplay
                            value={reservation.qr_code}
                            size={80}
                            title={reservation.menu?.title || 'Yemek Rezervasyonu'}
                          />
                        ) : (
                          <Chip
                            label={reservation.status === 'used' ? 'Kullanıldı' : 'QR Yok'}
                            size="small"
                            color={reservation.status === 'used' ? 'success' : 'default'}
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {reservation.status === 'reserved' && (
                          <Button
                            size="small"
                            color="error"
                            disabled={actionId === reservation.id}
                            onClick={() => openCancelDialog(reservation)}
                          >
                            {actionId === reservation.id ? <LoadingSpinner label="" /> : 'İptal et'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!reservations.length && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">Rezervasyon bulunamadı.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onClose={closeCancelDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Rezervasyonu İptal Et</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{reservationToCancel?.menu?.title || reservationToCancel?.menu?.name || 'Bu menü'}</strong> için olan rezervasyonunuzu iptal etmek istediğinize emin misiniz?
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            İptal işlemi geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCancelDialog}>Vazgeç</Button>
          <Button onClick={handleConfirmCancel} color="error" variant="contained" disabled={actionId === reservationToCancel?.id}>
            {actionId === reservationToCancel?.id ? 'İptal ediliyor...' : 'İptal Et'}
          </Button>
        </DialogActions>
      </Dialog>

      <Toast open={toast.open} onClose={() => setToast((prev) => ({ ...prev, open: false }))} type={toast.type} message={toast.message} />
    </Stack>
  );
}

export default MealReservationsPage;
