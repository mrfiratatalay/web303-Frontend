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
import { useParams } from 'react-router-dom';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Toast from '../../components/feedback/Toast';
import {
  checkInRegistration,
  extractData,
  getEventById,
  getEventRegistrations,
} from '../../services/eventApi';
import { Event, EventRegistration } from '../../types/events';
import { getErrorMessage } from '../../utils/error';

function EventRegistrationsPage() {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ open: boolean; message: string; type?: 'success' | 'info' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  });

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [eventResponse, regResponse] = await Promise.all([
        getEventById(id),
        getEventRegistrations(id),
      ]);
      setEvent(extractData<Event>(eventResponse));
      setRegistrations(extractData<EventRegistration[]>(regResponse) || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Kayitlar yuklenemedi.'));
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCheckIn = async (registration: EventRegistration) => {
    if (!id) return;
    setActionLoading(registration.id);
    setError('');
    try {
      await checkInRegistration(id, registration.id);
      setToast({ open: true, message: 'Check-in basarili.', type: 'success' });
      loadData();
    } catch (err) {
      setError(getErrorMessage(err, 'Check-in basarisiz.'));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Etkinlik kayitlari
      </Typography>
      {event && (
        <Typography color="text.secondary">
          {event.title}
        </Typography>
      )}

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
                    <TableCell>Katilimci</TableCell>
                    <TableCell>E-posta</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell align="right">Islem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell>
                        {reg.user?.first_name || reg.user?.last_name
                          ? `${reg.user?.first_name || ''} ${reg.user?.last_name || ''}`.trim()
                          : reg.user_id || '-'}
                      </TableCell>
                      <TableCell>{reg.user?.email || '-'}</TableCell>
                      <TableCell>{reg.status || 'registered'}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleCheckIn(reg)}
                          disabled={actionLoading === reg.id || reg.status === 'checked_in'}
                        >
                          {reg.status === 'checked_in'
                            ? 'Check-in yapildi'
                            : actionLoading === reg.id
                              ? 'Check-in yapiliyor...'
                              : 'Check-in'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!registrations.length && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary">Henuz kayit yok.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, open: false }))} />
    </Stack>
  );
}

export default EventRegistrationsPage;
