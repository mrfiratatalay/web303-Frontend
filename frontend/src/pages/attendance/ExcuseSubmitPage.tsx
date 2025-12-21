import { useEffect, useState } from 'react';
import {
  Autocomplete,
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
import { submitExcuse, getMyActiveSessions, extractData, ActiveSession } from '../../services/attendanceApi';
import { getErrorMessage } from '../../utils/error';
import { getMyCourses, extractData as extractEnrollmentData } from '../../services/enrollmentApi';
import { Enrollment } from '../../types/academics';

type SessionOption = {
  sessionId: string;
  label: string;
  courseCode: string;
  courseName: string;
  date: string;
};

function ExcuseSubmitPage() {
  const [sessions, setSessions] = useState<SessionOption[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionOption | null>(null);
  const [reason, setReason] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load student's enrolled courses and their past/closed sessions
  useEffect(() => {
    const loadSessionOptions = async () => {
      setSessionsLoading(true);
      try {
        // Get active sessions (where student might have missed)
        const activeRes = await getMyActiveSessions();
        const activeSessions = extractData<ActiveSession[]>(activeRes) || [];

        // Also get from my courses if available (for closed sessions)
        let allSessions: SessionOption[] = activeSessions.map((s) => ({
          sessionId: s.id,
          label: `${s.course.code} / ${s.section_number} - ${s.date} ${s.start_time}`,
          courseCode: s.course.code,
          courseName: s.course.name,
          date: `${s.date} ${s.start_time}`,
        }));

        setSessions(allSessions);
      } catch (err) {
        console.warn('Oturumlar yüklenemedi:', err);
        setSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    };
    loadSessionOptions();
  }, []);

  const handleSubmit = async () => {
    if (!selectedSession) {
      setError('Lütfen bir yoklama oturumu seçin.');
      return;
    }
    if (!reason.trim()) {
      setError('Lütfen mazeret açıklaması girin.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await submitExcuse({ session_id: selectedSession.sessionId, reason, document: file });
      setMessage('Mazeretiniz başarıyla gönderildi. Öğretmeniniz inceleyecektir.');
      setSelectedSession(null);
      setReason('');
      setFile(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Mazeret gönderilemedi.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Mazeret Bildirimi
      </Typography>
      {message && <Alert variant="success" message={message} />}
      {error && <Alert variant="error" message={error} />}

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Autocomplete
              fullWidth
              options={sessions}
              loading={sessionsLoading}
              getOptionLabel={(option) => option.label}
              value={selectedSession}
              onChange={(_, value) => setSelectedSession(value)}
              isOptionEqualToValue={(option, value) => option.sessionId === value?.sessionId}
              noOptionsText={sessionsLoading ? 'Yükleniyor...' : 'Aktif yoklama oturumu bulunamadı'}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Yoklama Oturumu"
                  placeholder={sessionsLoading ? 'Oturumlar yükleniyor...' : 'Mazeret göndereceğiniz dersi seçin'}
                  helperText="Kayıtlı olduğunuz derslerdeki aktif yoklama oturumları listelenir"
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.sessionId}>
                  <Box>
                    <Typography fontWeight={600}>{option.courseCode}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {option.courseName} • {option.date}
                    </Typography>
                  </Box>
                </li>
              )}
            />

            <TextField
              label="Mazeret Açıklaması"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              minRows={3}
              placeholder="Mazeret nedeninizi ayrıntılı olarak açıklayın (en az 10 karakter)"
              helperText="Örn: Sağlık sorunu nedeniyle derse katılamadım."
            />

            <Box>
              <Button variant="outlined" component="label">
                {file ? '📎 ' + file.name : 'Belge Ekle (JPEG/PNG/PDF, 5MB)'}
                <input
                  hidden
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </Button>
              {file && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => setFile(null)}
                  sx={{ ml: 1 }}
                >
                  Kaldır
                </Button>
              )}
            </Box>

            <Box>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !selectedSession || !reason.trim()}
              >
                {loading ? <LoadingSpinner label="Gönderiliyor..." /> : 'Mazeret Gönder'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">
            📋 <strong>Bilgi:</strong> Mazeretiniz, dersin öğretim görevlisine iletilecektir.
            Onaylanma durumunu "Yoklama Özeti" sayfasından takip edebilirsiniz.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default ExcuseSubmitPage;
