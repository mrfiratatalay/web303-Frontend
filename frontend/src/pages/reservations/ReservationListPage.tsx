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
import {
  approveReservation,
  extractData,
  getReservations,
  rejectReservation,
} from '../../services/reservationApi';
import { Reservation } from '../../types/reservations';
import { getErrorMessage } from '../../utils/error';

const formatDateRange = (start?: string, end?: string) => {
  if (!start || !end) {
    return '-';
  }
  return `${new Date(start).toLocaleString('tr-TR')} - ${new Date(end).toLocaleString('tr-TR')}`;
};

const formatClassroom = (reservation: Reservation) => {
  if (reservation.classroom) {
    const building = reservation.classroom.building || '';
    const room = reservation.classroom.room_number || reservation.classroom.id;
    return `${building} ${room}`.trim();
  }
  return reservation.classroom_id;
};

const formatStudent = (reservation: Reservation) => {
  // Backend may return user or student.user
  const user = reservation.user || reservation.student?.user;
  if (user) {
    const first = user.first_name || '';
    const last = user.last_name || '';
    const name = `${first} ${last}`.trim();
    return name || user.email || '-';
  }
  return reservation.user_id || reservation.student_id || '-';
};

function ReservationListPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
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
      const response = await getReservations();
      // Backend returns { reservations: [...], total, page, limit }
      const rawData = extractData<{ reservations?: Reservation[] } | Reservation[]>(response);
      let resList: Reservation[] = [];
      if (rawData && typeof rawData === 'object' && 'reservations' in rawData && Array.isArray(rawData.reservations)) {
        resList = rawData.reservations;
      } else if (Array.isArray(rawData)) {
        resList = rawData;
      }
      setReservations(resList);
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

  const handleDecision = async (id: string, action: 'approve' | 'reject') => {
    setActionId(id);
    setError('');
    try {
      if (action === 'approve') {
        await approveReservation(id);
      } else {
        await rejectReservation(id);
      }
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === id
            ? { ...reservation, status: action === 'approve' ? 'approved' : 'rejected' }
            : reservation,
        ),
      );
      setToast({
        open: true,
        type: 'success',
        message: action === 'approve' ? 'Rezervasyon onaylandi.' : 'Rezervasyon reddedildi.',
      });
    } catch (err) {
      const message = getErrorMessage(err, 'İşlem başarısız.');
      setError(message);
      setToast({ open: true, type: 'error', message });
    } finally {
      setActionId(null);
    }
  };

  const handleCloseToast = () => setToast((prev) => ({ ...prev, open: false }));

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Rezervasyon Talepleri
      </Typography>

      {error && <Alert variant="error" message={error} />}
      <Toast open={toast.open} onClose={handleCloseToast} type={toast.type} message={toast.message} />

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
                    <TableCell>Derslik</TableCell>
                    <TableCell>Zaman</TableCell>
                    <TableCell>Ogrenci</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell align="right">İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.map((reservation) => {
                    const isPending = reservation.status === 'pending';
                    const busy = actionId === reservation.id;
                    return (
                      <TableRow key={reservation.id}>
                        <TableCell>{formatClassroom(reservation)}</TableCell>
                        <TableCell>{formatDateRange(reservation.start_time, reservation.end_time)}</TableCell>
                        <TableCell>{formatStudent(reservation)}</TableCell>
                        <TableCell>{reservation.status}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="contained"
                              disabled={!isPending || busy}
                              onClick={() => handleDecision(reservation.id, 'approve')}
                            >
                              {busy && isPending ? <LoadingSpinner label="" /> : 'Onayla'}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              disabled={!isPending || busy}
                              onClick={() => handleDecision(reservation.id, 'reject')}
                            >
                              {busy && isPending ? <LoadingSpinner label="" /> : 'Reddet'}
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!reservations.length && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">Rezervasyon talebi bulunamadı.</Typography>
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

export default ReservationListPage;
