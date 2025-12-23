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
        setError(getErrorMessage(err, 'Rezervasyonlar yuklenemedi.'));
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
          <LoadingSpinner label="Rezervasyonlar yukleniyor..." />
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
                      <TableCell>{formatDateRange(reservation.start_time, reservation.end_time)}</TableCell>
                      <TableCell>{reservation.status}</TableCell>
                      <TableCell>{reservation.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {!reservations.length && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
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

export default MyReservationsPage;
