import { useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Alert from '../../components/feedback/Alert';
import { AttendanceReport, AttendanceSession, Section } from '../../types/academics';
import { extractData, getAttendanceReport, getMySessions } from '../../services/attendanceApi';
import { getSections, extractData as extractSectionData } from '../../services/sectionApi';
import { getErrorMessage } from '../../utils/error';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const SESSION_STATUS_LABELS: Record<string, string> = {
  active: 'Aktif',
  closed: 'Kapalı',
  upcoming: 'Planlandı',
};

function AttendanceReportPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState('');

  // Load instructor's sections (admin sees all)
  useEffect(() => {
    const loadSections = async () => {
      if (!user?.id) return;
      setSectionsLoading(true);
      try {
        // Admin tüm dersleri görür, faculty sadece kendi derslerini
        const params = user.role === 'admin'
          ? { limit: 50 }
          : { instructor_id: user.id, limit: 50 };
        const response = await getSections(params);
        const data = extractSectionData<{ sections: Section[] }>(response);
        setSections(data?.sections || []);
      } catch (err) {
        console.warn('Şubeler yüklenemedi:', err);
      } finally {
        setSectionsLoading(false);
      }
    };
    loadSections();
  }, [user?.id, user?.role]);

  // Load sessions for selected section
  useEffect(() => {
    const loadSessions = async () => {
      if (!selectedSection) {
        setSessions([]);
        setReport(null);
        return;
      }
      setSessionsLoading(true);
      setError('');
      try {
        const response = await getMySessions({ section_id: selectedSection.id, limit: 50 });
        const data = extractData<AttendanceSession[]>(response);
        setSessions(data || []);
      } catch (err) {
        setError(getErrorMessage(err, 'Oturumlar yüklenemedi.'));
        setSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    };
    loadSessions();
  }, [selectedSection]);

  // Load report for selected section
  useEffect(() => {
    const loadReport = async () => {
      if (!selectedSection) {
        setReport(null);
        return;
      }
      setReportLoading(true);
      try {
        const response = await getAttendanceReport(selectedSection.id);
        const data = extractData<AttendanceReport>(response);
        setReport(data || null);
      } catch (err) {
        console.warn('Rapor yüklenemedi:', err);
        setReport(null);
      } finally {
        setReportLoading(false);
      }
    };
    loadReport();
  }, [selectedSection]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Yoklama Raporu
      </Typography>
      {error && <Alert variant="error" message={error} />}

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            Ders Seçin
          </Typography>
          <Autocomplete
            fullWidth
            options={sections}
            loading={sectionsLoading}
            getOptionLabel={(option) =>
              `${option.course?.code || option.course_id} / ${option.section_number} — ${option.course?.name || 'Şube'}`
            }
            value={selectedSection}
            onChange={(_, value) => setSelectedSection(value)}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Şube"
                placeholder={sectionsLoading ? 'Şubeler yükleniyor...' : 'Şube seçin'}
              />
            )}
          />
        </CardContent>
      </Card>

      {selectedSection && (
        <>
          {/* Sessions List */}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Açılan Yoklamalar - {selectedSection.course?.code} / {selectedSection.section_number}
              </Typography>
              {sessionsLoading ? (
                <Box py={2} textAlign="center">
                  <LoadingSpinner label="Oturumlar yükleniyor..." />
                </Box>
              ) : sessions.length === 0 ? (
                <Typography color="text.secondary">Bu ders için henüz yoklama açılmamış.</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Tarih</TableCell>
                        <TableCell>Durum</TableCell>
                        <TableCell>QR Kodu</TableCell>
                        <TableCell align="right">İşlem</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            {session.date} {session.start_time}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={SESSION_STATUS_LABELS[session.status] || session.status}
                              color={session.status === 'active' ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                              {session.qr_code?.substring(0, 8)}...
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Button size="small" onClick={() => navigate(`/attendance/sessions/${session.id}`)}>
                              Detay
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          {/* Attendance Report */}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>
                Öğrenci Katılım Özeti
              </Typography>
              {reportLoading ? (
                <Box py={2} textAlign="center">
                  <LoadingSpinner label="Rapor yükleniyor..." />
                </Box>
              ) : report ? (
                <>
                  <Stack direction="row" spacing={2} mb={2}>
                    <Chip label={`Toplam Oturum: ${report.totalSessions ?? 0}`} variant="outlined" />
                    <Chip label={`Ortalama Katılım: ${report.attendanceRate ?? 0}%`} color="primary" />
                  </Stack>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Öğrenci</TableCell>
                          <TableCell>Numara</TableCell>
                          <TableCell>Katılım</TableCell>
                          <TableCell>Devamsızlık</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.isArray(report.students) && report.students.length > 0 ? (
                          report.students.map((s, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{s.name}</TableCell>
                              <TableCell>{s.studentNumber}</TableCell>
                              <TableCell>
                                <Chip
                                  label={`${s.attendanceRate ?? 0}%`}
                                  size="small"
                                  color={(s.attendanceRate ?? 0) >= 70 ? 'success' : 'error'}
                                />
                              </TableCell>
                              <TableCell>{s.absences ?? 0}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              <Typography color="text.secondary">Kayıtlı öğrenci yok.</Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Typography color="text.secondary">Rapor verisi yok.</Typography>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Stack>
  );
}

export default AttendanceReportPage;
