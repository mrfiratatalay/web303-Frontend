import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Toast from '../../components/feedback/Toast';
import { extractData, generateSchedule } from '../../services/schedulingApi';
import { getErrorMessage } from '../../utils/error';

function GenerateSchedulePage() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [semester, setSemester] = useState('fall');
  const [year, setYear] = useState(String(currentYear));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  const handleSubmit = async () => {
    if (!year || Number.isNaN(Number(year))) {
      setError('Yıl gereklidir.');
      return;
    }
    setLoading(true);
    setError('');
    setScheduleId(null);
    try {
      const response = await generateSchedule({
        semester,
        year: Number(year),
        notes: notes.trim() || undefined,
      });
      const data = extractData<{ scheduleId?: string; id?: string; message?: string }>(response);
      const createdId = data?.scheduleId || data?.id || null;
      setScheduleId(createdId);
      setToast({ open: true, type: 'success', message: data?.message || 'Program oluşturuldu.' });
    } catch (err) {
      const message = getErrorMessage(err, 'Program oluşturma başarısız.');
      setError(message);
      setToast({ open: true, type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Program Oluştur
      </Typography>

      {error && <Alert variant="error" message={error} />}
      <Toast open={toast.open} onClose={() => setToast((prev) => ({ ...prev, open: false }))} type={toast.type} message={toast.message} />

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              select
              label="Donem"
              SelectProps={{ native: true }}
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value="fall">Guz</option>
              <option value="spring">Bahar</option>
              <option value="summer">Yaz</option>
            </TextField>
            <TextField
              label="Yil"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
            <TextField
              label="Not (opsiyonel)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              minRows={2}
              placeholder="Opsiyonel not"
            />
            <Box>
              <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                {loading ? <LoadingSpinner label="Oluşturuluyor..." /> : 'Oluştur'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {scheduleId && (
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography fontWeight={700}>Program ID: {scheduleId}</Typography>
              <Button variant="outlined" onClick={() => navigate(`/scheduling/${scheduleId}`)}>
                Program detayını gör
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}

export default GenerateSchedulePage;
