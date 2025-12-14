import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { AttendanceSession } from '../../types/academics';
import { closeSession, createSession, extractData, getMySessions } from '../../services/attendanceApi';
import { getErrorMessage } from '../../utils/error';
import { useNavigate } from 'react-router-dom';

function FacultySessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ section_id: '', geofence_radius: 15, latitude: '', longitude: '' });
  const [creating, setCreating] = useState(false);

  const loadSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMySessions();
      const data = extractData<AttendanceSession[]>(response);
      setSessions(data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Oturumlar yüklenemedi.'));
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError('');
    setMessage('');
    try {
      await createSession({
        section_id: form.section_id,
        geofence_radius: Number(form.geofence_radius),
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      });
      setMessage('Oturum oluşturuldu.');
      loadSessions();
    } catch (err) {
      setError(getErrorMessage(err, 'Oturum oluşturulamadı.'));
    } finally {
      setCreating(false);
    }
  };

  const handleClose = async (id: string) => {
    setError('');
    setMessage('');
    try {
      await closeSession(id);
      setMessage('Oturum kapatıldı.');
      loadSessions();
    } catch (err) {
      setError(getErrorMessage(err, 'Oturum kapatılamadı.'));
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Yoklama Oturumları
      </Typography>
      {message && <Alert variant="success" message={message} />}
      {error && <Alert variant="error" message={error} />}

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            Yeni Oturum
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Section ID"
                value={form.section_id}
                onChange={(e) => setForm((prev) => ({ ...prev, section_id: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                type="number"
                label="Geofence (m)"
                value={form.geofence_radius}
                onChange={(e) => setForm((prev) => ({ ...prev, geofence_radius: Number(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Latitude"
                value={form.latitude}
                onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Longitude"
                value={form.longitude}
                onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={3} display="flex" alignItems="center">
              <Button variant="contained" onClick={handleCreate} disabled={creating || !form.section_id}>
                {creating ? <LoadingSpinner label="Oluşturuluyor..." /> : 'Oluştur'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {loading ? (
        <Box py={4}>
          <LoadingSpinner label="Yükleniyor..." />
        </Box>
      ) : (
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Section</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell>QR</TableCell>
                    <TableCell align="right">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.section?.course?.code} / {s.section?.section_number}</TableCell>
                      <TableCell>{s.status}</TableCell>
                      <TableCell>{s.date} {s.start_time}</TableCell>
                      <TableCell>{s.qr_code}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" onClick={() => navigate(`/attendance/sessions/${s.id}`)}>Detay</Button>
                          {s.status === 'active' && (
                            <Button size="small" color="error" onClick={() => handleClose(s.id)}>
                              Kapat
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!sessions.length && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">Kayıt yok.</Typography>
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

export default FacultySessionsPage;
