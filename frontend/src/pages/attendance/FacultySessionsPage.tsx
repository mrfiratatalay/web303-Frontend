import { useEffect, useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
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
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { AttendanceSession, Section } from '../../types/academics';
import { closeSession, createSession, extractData, getMySessions } from '../../services/attendanceApi';
import { getErrorMessage } from '../../utils/error';
import { useNavigate } from 'react-router-dom';
import { getSections } from '../../services/sectionApi';
import { useAuth } from '../../hooks/useAuth';
import { QRCodeSVG } from 'qrcode.react';

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
  const [qrModalSession, setQrModalSession] = useState<AttendanceSession | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedSection = useMemo(
    () => sections.find((s) => s.id === form.section_id) || null,
    [sections, form.section_id],
  );

  const activeSessions = sessions.filter((s) => s.status === 'active');

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

  const handleCopyQr = async (qrCode: string) => {
    try {
      await navigator.clipboard.writeText(qrCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        📋 Yoklama Oturumları
      </Typography>
      {message && <Alert variant="success" message={message} />}
      {error && <Alert variant="error" message={error} />}

      {/* Active Session QR Display */}
      {activeSessions.length > 0 && (
        <Card sx={{ bgcolor: 'success.50', border: '2px solid', borderColor: 'success.main' }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight={700} color="success.dark">
                  🟢 Aktif Oturum - QR Kodu Projeksiyona Yansıtın
                </Typography>
                <Chip label="CANLI" color="success" size="small" />
              </Stack>
              
              {activeSessions.map((session) => (
                <Card key={session.id} sx={{ bgcolor: 'white' }}>
                  <CardContent>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                      {/* QR Code */}
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 2,
                          border: '4px solid',
                          borderColor: 'success.main',
                          cursor: 'pointer',
                        }}
                        onClick={() => setQrModalSession(session)}
                      >
                        <QRCodeSVG value={session.qr_code} size={180} level="H" />
                      </Box>

                      {/* Session Info */}
                      <Stack spacing={1} flex={1}>
                        <Typography variant="h6" fontWeight={700}>
                          {session.section?.course?.code} - {session.section?.course?.name}
                        </Typography>
                        <Typography color="text.secondary">
                          Şube: {session.section?.section_number} | Tarih: {session.date} {session.start_time}
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                          QR: {session.qr_code}
                        </Typography>
                        <Stack direction="row" spacing={1} mt={1}>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<FullscreenIcon />}
                            onClick={() => setQrModalSession(session)}
                          >
                            Tam Ekran QR
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<ContentCopyIcon />}
                            onClick={() => handleCopyQr(session.qr_code)}
                          >
                            {copied ? 'Kopyalandı!' : 'Kopyala'}
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleClose(session.id)}
                          >
                            Kapat
                          </Button>
                        </Stack>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Create New Session */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            ➕ Yeni Oturum Başlat
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
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
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Enlem"
                value={form.latitude}
                onChange={(e) => setForm((prev) => ({ ...prev, latitude: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                fullWidth
                label="Boylam"
                value={form.longitude}
                onChange={(e) => setForm((prev) => ({ ...prev, longitude: e.target.value }))}
              />
            </Grid>
            <Grid item xs={6} md={4} display="flex" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center" width="100%">
                <Button variant="outlined" onClick={handleUseLocation}>
                  Konumu doldur
                </Button>
                <Button variant="contained" onClick={handleCreate} disabled={creating || !form.section_id}>
                  {creating ? <LoadingSpinner label="Oluşturuluyor..." /> : 'Şimdi başlat'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sessions List */}
      {loading ? (
        <Box py={4}>
          <LoadingSpinner label="Yükleniyor..." />
        </Box>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              📜 Tüm Oturumlar
            </Typography>
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
                      <TableCell>
                        <Chip
                          label={SESSION_STATUS_LABELS[s.status] || s.status}
                          color={s.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {s.date} {s.start_time}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {s.status === 'active' && (
                            <IconButton size="small" onClick={() => setQrModalSession(s)}>
                              <QrCode2Icon />
                            </IconButton>
                          )}
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            {s.qr_code.substring(0, 8)}...
                          </Typography>
                        </Stack>
                      </TableCell>
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

      {/* Fullscreen QR Modal */}
      <Dialog
        open={!!qrModalSession}
        onClose={() => setQrModalSession(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'white',
            minHeight: '70vh',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack>
            <Typography variant="h5" fontWeight={700}>
              📱 Yoklama QR Kodu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bu QR kodu öğrencilerin görebileceği şekilde projeksiyona yansıtın
            </Typography>
          </Stack>
          <IconButton onClick={() => setQrModalSession(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {qrModalSession && (
            <Stack spacing={3} alignItems="center" py={3}>
              {/* Course Info */}
              <Box textAlign="center">
                <Typography variant="h4" fontWeight={700} color="primary.main">
                  {qrModalSession.section?.course?.code}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {qrModalSession.section?.course?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Şube: {qrModalSession.section?.section_number} | {qrModalSession.date} {qrModalSession.start_time}
                </Typography>
              </Box>

              {/* Large QR Code */}
              <Box
                sx={{
                  p: 3,
                  bgcolor: 'white',
                  borderRadius: 3,
                  border: '6px solid',
                  borderColor: 'success.main',
                  boxShadow: 4,
                }}
              >
                <QRCodeSVG value={qrModalSession.qr_code} size={350} level="H" />
              </Box>

              {/* QR Code Text */}
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'monospace',
                  bgcolor: 'grey.100',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                }}
              >
                {qrModalSession.qr_code}
              </Typography>

              {/* Instructions */}
              <Box
                sx={{
                  bgcolor: 'info.light',
                  p: 2,
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body1" fontWeight={600} color="info.dark">
                  📲 Öğrenciler bu QR kodu telefonlarıyla tarayarak yoklama verebilir
                </Typography>
                <Typography variant="body2" color="info.dark">
                  Yoklama Ver → QR Tara ve Yoklama Ver
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

export default FacultySessionsPage;
