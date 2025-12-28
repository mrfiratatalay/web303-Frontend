import { useEffect, useState } from 'react';
import {
  Box,
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
import { extractData, getMyReservations } from '../../services/reservationApi';
import { Reservation } from '../../types/reservations';
import { getErrorMessage } from '../../utils/error';

const formatDateRange = (reservation: Reservation) => {
  const { date, start_time, end_time } = reservation;
  if (!date && !start_time) return '-';
  // date: 2024-12-24, start_time: 14:43, end_time: 15:43
  const dateStr = date ? new Date(date).toLocaleDateString('tr-TR') : '-';
  const startStr = start_time || '-';
  const endStr = end_time || '-';
  return `${dateStr} ${startStr} - ${endStr}`;
};

const statusTurkish: Record<string, string> = {
  pending: 'Beklemede',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  cancelled: 'İptal Edildi',
  completed: 'Tamamlandı',
};

const formatClassroom = (reservation: Reservation) => {
  if (reservation.classroom) {
    const building = reservation.classroom.building || '';
    const room = reservation.classroom.room_number || reservation.classroom.id;
    return `${building} ${room}`.trim();
  }
  return reservation.classroom_id;
};

function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReservations = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getMyReservations();
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
    loadReservations();
  }, []);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Rezervasyonlarim
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
                    <TableCell>Derslik</TableCell>
                    <TableCell>Zaman</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Not</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>{formatClassroom(reservation)}</TableCell>
                      <TableCell>{formatDateRange(reservation)}</TableCell>
                      <TableCell>{statusTurkish[reservation.status] || reservation.status}</TableCell>
                      <TableCell>{reservation.purpose || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {!reservations.length && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
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
    </Stack>
  );
}

export default MyReservationsPage;
