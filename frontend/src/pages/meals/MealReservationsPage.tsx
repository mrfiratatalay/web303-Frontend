import { useEffect, useState } from 'react';
import {
  Box,
  Button,
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
} from '@mui/material';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Toast from '../../components/feedback/Toast';
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

  const loadReservations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMyMealReservations();
      const data = extractData<MealReservation[] | MealReservation>(response);
      setReservations(Array.isArray(data) ? data : data ? [data] : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Rezervasyonlar yuklenemedi.'));
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleCancel = async (reservationId: string) => {
    setActionId(reservationId);
    setError('');
    try {
      await cancelMealReservation(reservationId);
      setToast({ open: true, type: 'success', message: 'Rezervasyon iptal edildi.' });
      setReservations((prev) => prev.filter((item) => item.id !== reservationId));
    } catch (err) {
      const message = getErrorMessage(err, 'Iptal basarisiz.');
      setError(message);
      setToast({ open: true, type: 'error', message });
    } finally {
      setActionId(null);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Yemek rezervasyonlarim
      </Typography>

      {error && <Alert variant="error" message={error} />}
      <Toast open={toast.open} onClose={() => setToast((prev) => ({ ...prev, open: false }))} type={toast.type} message={toast.message} />

      {loading ? (
        <Box py={4}>
          <LoadingSpinner label="Rezervasyonlar yukleniyor..." />
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
                    <TableCell align="right">Islem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>{reservation.menu?.title || reservation.menu?.name || reservation.menu_id || '-'}</TableCell>
                      <TableCell>{reservation.menu?.date || reservation.reserved_at || '-'}</TableCell>
                      <TableCell>{reservation.status || '-'}</TableCell>
                      <TableCell>{reservation.qr_code || '-'}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          color="error"
                          disabled={actionId === reservation.id}
                          onClick={() => handleCancel(reservation.id)}
                        >
                          {actionId === reservation.id ? <LoadingSpinner label="" /> : 'Iptal et'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!reservations.length && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">Rezervasyon bulunamadi.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}

export default MealReservationsPage;
