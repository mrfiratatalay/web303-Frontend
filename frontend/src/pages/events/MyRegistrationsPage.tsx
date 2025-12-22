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
import { Link as RouterLink } from 'react-router-dom';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Toast from '../../components/feedback/Toast';
import { cancelRegistration, extractData, getMyRegistrations } from '../../services/eventApi';
import { EventRegistration } from '../../types/events';
import { getErrorMessage } from '../../utils/error';

function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
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

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Kayitlarim
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
                    <TableCell align="right">Islem</TableCell>
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
                      <TableCell>{reg.event?.start_time || '-'}</TableCell>
                      <TableCell>{reg.status || 'registered'}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleCancel(reg)}
                          disabled={actionLoading === reg.id}
                        >
                          {actionLoading === reg.id ? 'Iptal ediliyor...' : 'Iptal et'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!registrations.length && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
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

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, open: false }))} />
    </Stack>
  );
}

export default MyRegistrationsPage;
