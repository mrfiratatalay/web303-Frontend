import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Toast from '../../components/feedback/Toast';
import { useAuth } from '../../hooks/useAuth';
import {
  cancelRegistration,
  deleteEvent,
  extractData,
  getEventById,
  registerForEvent,
} from '../../services/eventApi';
import { Event, EventRegistration } from '../../types/events';
import { getErrorMessage } from '../../utils/error';

function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; message: string; type?: 'success' | 'info' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  });

  const loadEvent = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
      try {
        const response = await getEventById(id);
        const data = extractData<Event>(response);
        setEvent(data);
      } catch (err) {
        setError(getErrorMessage(err, 'Etkinlik yuklenemedi.'));
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    loadEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const registrationId = useMemo(() => {
    return (
      event?.my_registration?.id ||
      (event as Event & { registration?: EventRegistration | null })?.registration?.id ||
      event?.registration_id ||
      null
    );
  }, [event]);

  const isRegistered = useMemo(() => {
    if (typeof event?.is_registered === 'boolean') return event.is_registered;
    if (typeof event?.isRegistered === 'boolean') return event.isRegistered;
    return Boolean(registrationId);
  }, [event, registrationId]);

  const handleRegister = async () => {
    if (!id) return;
    setActionLoading(true);
    setError('');
    try {
      await registerForEvent(id);
      setToast({ open: true, message: 'Kayit basarili.', type: 'success' });
      loadEvent();
    } catch (err) {
      setError(getErrorMessage(err, 'Kayit basarisiz.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!id) return;
    if (!registrationId) {
      setError('Kayit ID bulunamadi.');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      await cancelRegistration(id, registrationId);
      setToast({ open: true, message: 'Kayit iptal edildi.', type: 'success' });
      loadEvent();
    } catch (err) {
      setError(getErrorMessage(err, 'Iptal basarisiz.'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setActionLoading(true);
    setError('');
    try {
      await deleteEvent(id);
      navigate('/events', {
        state: { toast: { message: 'Etkinlik silindi.', type: 'success' } },
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Silme basarisiz.'));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box py={4}>
        <LoadingSpinner label="Etkinlik yukleniyor..." />
      </Box>
    );
  }

  if (error || !event) {
    return <Alert variant="error" message={error || 'Etkinlik bulunamadi.'} />;
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={event.status || 'planlandi'} color="primary" />
          <Typography variant="h5" fontWeight={800}>
            {event.title}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          {user?.role === 'admin' && (
            <Button variant="contained" color="error" size="small" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? 'Siliniyor...' : 'Sil'}
            </Button>
          )}
        </Stack>
      </Stack>

      {error && <Alert variant="error" message={error} />}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} divider={<Divider flexItem orientation="vertical" />}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" color="text.secondary">
                  Tarih
                </Typography>
                <Typography>{event.start_time || '-'} {event.end_time ? `- ${event.end_time}` : ''}</Typography>
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" color="text.secondary">
                  Konum
                </Typography>
                <Typography>{event.location || '-'}</Typography>
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" color="text.secondary">
                  Kapasite
                </Typography>
                <Typography>
                  {typeof event.capacity === 'number'
                    ? `${event.registered_count || 0} / ${event.capacity}`
                    : event.registered_count || '-'}
                </Typography>
              </Stack>
            </Stack>
            <Stack spacing={0.5}>
              <Typography variant="subtitle2" color="text.secondary">
                Aciklama
              </Typography>
              <Typography>{event.description || '-'}</Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Kayit" />
        <CardContent>
          <Stack spacing={2}>
            <Typography color="text.secondary">
              {isRegistered
                ? 'Bu etkinlige kayitlisiniz.'
                : 'Katilmak icin kayit olun.'}
            </Typography>
            <Stack direction="row" spacing={1}>
              {isRegistered ? (
                <Button variant="outlined" onClick={handleUnregister} disabled={actionLoading}>
                  {actionLoading ? 'Iptal ediliyor...' : 'Kaydi iptal et'}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleRegister} disabled={actionLoading}>
                  {actionLoading ? 'Kayit yapiliyor...' : 'Kayit ol'}
                </Button>
              )}
              <Button variant="text" component={RouterLink} to="/events/my-registrations">
                Kayitlarim
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </Stack>
  );
}

export default EventDetailPage;
