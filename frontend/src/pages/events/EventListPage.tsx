import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Toast from '../../components/feedback/Toast';
import { getEvents, normalizeEventListResponse } from '../../services/eventApi';
import { Event, EventListQuery, EventListResult } from '../../types/events';
import { getErrorMessage } from '../../utils/error';

const DEFAULT_QUERY: EventListQuery = {
  page: 1,
  limit: 10,
  sort_by: 'start_time',
  sort_order: 'ASC',
};

function EventListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState<EventListQuery>(DEFAULT_QUERY);
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState<EventListResult['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [toast, setToast] = useState<{ open: boolean; message: string; type?: 'success' | 'info' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery((prev) => ({ ...prev, page: 1, search: searchInput.trim() || undefined }));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError('');
    try {
      const response = await getEvents(query);
      const data = normalizeEventListResponse(response, { page: query.page, limit: query.limit });
      setEvents(data.events);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(getErrorMessage(err, 'Etkinlikler yüklenemedi.'));
      setEvents([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };
    loadEvents();
  }, [query]);

  useEffect(() => {
    const toastState = (location.state as { toast?: { message?: string; type?: 'success' | 'info' | 'error' } })?.toast;
    if (toastState?.message) {
      setToast({ open: true, message: toastState.message, type: toastState.type || 'success' });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  const handlePageChange = (_: unknown, newPage: number) => {
    setQuery((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleRowsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const limit = parseInt(event.target.value, 10);
    setQuery((prev) => ({ ...prev, page: 1, limit }));
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight={800}>
          Etkinlikler
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              size="small"
              label="Ara"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Baslik veya konum"
            />
            <Button variant="outlined" size="small" onClick={() => setQuery(DEFAULT_QUERY)}>
              Sifirla
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert variant="error" message={error} />}

      {loading ? (
        <Box py={4}>
          <LoadingSpinner label="Etkinlikler yükleniyor..." />
        </Box>
      ) : (
        <Card>
          <CardHeader title="Etkinlik listesi" />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Baslik</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell>Konum</TableCell>
                    <TableCell>Kapasite</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map((event) => (
                    <TableRow
                      key={event.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      <TableCell>{event.title}</TableCell>
                      <TableCell>{event.start_time || '-'}</TableCell>
                      <TableCell>{event.location || '-'}</TableCell>
                      <TableCell>
                        {typeof event.capacity === 'number'
                          ? `${event.registered_count || 0} / ${event.capacity}`
                          : event.registered_count || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!events.length && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary">Henuz etkinlik yok.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={pagination?.total || 0}
              page={(query.page || 1) - 1}
              onPageChange={handlePageChange}
              rowsPerPage={query.limit || 10}
              onRowsPerPageChange={handleRowsChange}
              rowsPerPageOptions={[5, 10, 20, 50]}
            />
          </CardContent>
        </Card>
      )}

      <Toast open={toast.open} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, open: false }))} />
    </Stack>
  );
}

export default EventListPage;
