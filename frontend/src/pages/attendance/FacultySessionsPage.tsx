import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
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
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { AttendanceSession, Section } from '../../types/academics';
import { closeSession, createSession, extractData, getMySessions } from '../../services/attendanceApi';
import { getErrorMessage } from '../../utils/error';
import { useNavigate } from 'react-router-dom';
import { getSections } from '../../services/sectionApi';
import { useAuth } from '../../hooks/useAuth';

const SESSION_STATUS_LABELS: Record<string, string> = {
  active: 'Aktif',
  closed: 'Kapalı',
  upcoming: 'Planlandı',
};

const LAST_SECTION_KEY = 'facultySessions:lastSection';

function FacultySessionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ section_id: '', geofence_radius: 25, latitude: '', longitude: '' });
  const [creating, setCreating] = useState(false);

  const selectedSection = useMemo(
    () => sections.find((s) => s.id === form.section_id) || null,
    [sections, form.section_id],
  );

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

  const loadSections = async () => {
    setSectionsLoading(true);
    try {
      const response = await getSections({ instructor_id: user?.id, limit: 50 });
      const data = extractData<{ sections: Section[] }>(response);
      setSections(data?.sections || []);
    } catch (err) {
      console.warn('Şubeler getirilemedi:', err);
    } finally {
      setSectionsLoading(false);
    }
  };

  useEffect(() => {
    const lastSection = localStorage.getItem(LAST_SECTION_KEY) || '';
    if (lastSection) {
      setForm((prev) => ({ ...prev, section_id: lastSection }));
    }
    loadSessions();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadSections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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
      localStorage.setItem(LAST_SECTION_KEY, form.section_id);
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

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError('Tarayıcı konum desteği bulunamadı.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: String(pos.coords.latitude),
          longitude: String(pos.coords.longitude),
        }));
      },
      () => setError('Konum alınamadı. Lütfen izin verdiğinizden emin olun.'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
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
            <Grid item xs={12} md={6}>
              <Autocomplete
                fullWidth
                options={sections}
                loading={sectionsLoading}
                getOptionLabel={(option) =>
                  `${option.course?.code || option.course_id} / ${option.section_number} — ${option.course?.name || 'Şube'
                  }`
                }
                value={selectedSection}
                onChange={(_, value) =>
                  setForm((prev) => ({ ...prev, section_id: value?.id || '' }))
                }
                isOptionEqualToValue={(option, value) => option.id === value?.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Şube"
                    placeholder={sectionsLoading ? 'Şubeler yükleniyor...' : 'Şube seçin'}
                    helperText={!sectionsLoading && !sections.length ? 'Şubeleriniz yüklenemedi, ID girmeniz gerekebilir.' : ''}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                type="number"
                label="Konum çapı (m)"
                value={form.geofence_radius}
                onChange={(e) => setForm((prev) => ({ ...prev, geofence_radius: Number(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Enlem"
                value={form.latitude}
                onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                label="Boylam"
                value={form.longitude}
                onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={2} display="flex" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center" width="100%">
                <Button variant="outlined" onClick={handleUseLocation} fullWidth>
                  Konumu doldur
                </Button>
                <Button variant="contained" onClick={handleCreate} disabled={creating || !form.section_id} fullWidth>
                  {creating ? <LoadingSpinner label="Oluşturuluyor..." /> : 'Şimdi başlat'}
                </Button>
              </Stack>
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
                    <TableCell>Şube</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell>QR</TableCell>
                    <TableCell align="right">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        {s.section?.course?.code} / {s.section?.section_number}
                      </TableCell>
                      <TableCell>{SESSION_STATUS_LABELS[s.status] || s.status}</TableCell>
                      <TableCell>
                        {s.date} {s.start_time}
                      </TableCell>
                      <TableCell>{s.qr_code}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" onClick={() => navigate(`/attendance/sessions/${s.id}`)}>
                            Detay
                          </Button>
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
