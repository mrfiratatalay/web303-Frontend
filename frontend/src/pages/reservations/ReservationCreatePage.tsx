import { FormEvent, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Toast from '../../components/feedback/Toast';
import { createReservation, extractData } from '../../services/reservationApi';
import { Reservation } from '../../types/reservations';
import { getErrorMessage } from '../../utils/error';

function ReservationCreatePage() {
  const [classroomId, setClassroomId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!classroomId.trim()) {
      setError('Derslik ID gerekli.');
      return;
    }
    if (!startTime || !endTime) {
      setError('Baslangic ve bitis zamani gerekli.');
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      setError('Bitis zamani baslangictan sonra olmali.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const response = await createReservation({
        classroom_id: classroomId.trim(),
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        purpose: purpose.trim() || undefined,
      });
      const data = extractData<Reservation>(response);
      if (data?.id) {
        setToast({ open: true, type: 'success', message: 'Rezervasyon gonderildi.' });
      } else {
        setToast({ open: true, type: 'success', message: 'Rezervasyon olusturuldu.' });
      }
      setClassroomId('');
      setStartTime('');
      setEndTime('');
      setPurpose('');
    } catch (err) {
      const message = getErrorMessage(err, 'Rezervasyon olusturma basarisiz.');
      setError(message);
      setToast({ open: true, type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseToast = () => setToast((prev) => ({ ...prev, open: false }));

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Yeni Rezervasyon
      </Typography>

      {error && <Alert variant="error" message={error} />}
      <Toast open={toast.open} onClose={handleCloseToast} type={toast.type} message={toast.message} />

      <Card>
        <CardContent>
          <Stack spacing={2} component="form" onSubmit={handleSubmit}>
            <TextField
              label="Derslik ID"
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
              placeholder="Derslik ID girin"
            />
            <TextField
              label="Baslangic"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Bitis"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Amac"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Opsiyonel aciklama"
              multiline
              minRows={2}
            />
            <Box>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? <LoadingSpinner label="Gonderiliyor..." /> : 'Rezervasyon olustur'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default ReservationCreatePage;

