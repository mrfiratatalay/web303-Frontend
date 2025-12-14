import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Alert from '../../components/feedback/Alert';
import { Section } from '../../types/academics';
import { extractData, getSectionById } from '../../services/sectionApi';
import { getErrorMessage } from '../../utils/error';
import { useAuth } from '../../hooks/useAuth';
import { enrollInSection } from '../../services/enrollmentApi';

function SectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const response = await getSectionById(id);
        const data = extractData<Section>(response);
        setSection(data);
      } catch (err) {
        setError(getErrorMessage(err, 'Section yüklenemedi.'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleEnroll = async () => {
    if (!id) return;
    setEnrolling(true);
    setMessage('');
    setError('');
    try {
      await enrollInSection(id);
      setMessage('Derse kaydınız alındı.');
    } catch (err) {
      setError(getErrorMessage(err, 'Kayıt başarısız.'));
    } finally {
      setEnrolling(false);
    }
  };

  const schedule = useMemo(() => section?.schedule_json || [], [section]);

  if (loading) {
    return (
      <Box py={4}>
        <LoadingSpinner label="Section yükleniyor..." />
      </Box>
    );
  }

  if (error || !section) {
    return <Alert variant="error" message={error || 'Section bulunamadı.'} />;
  }

  return (
    <Stack spacing={2}>
      {message && <Alert variant="success" message={message} />}
      {error && <Alert variant="error" message={error} />}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={section.course?.code || section.course_id} color="primary" />
          <Typography variant="h5" fontWeight={800}>
            Section {section.section_number} ({section.semester} {section.year})
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          {user?.role === 'admin' && (
            <Button
              variant="outlined"
              size="small"
              component={RouterLink}
              to={`/admin/sections/${section.id}/edit`}
            >
              Düzenle
            </Button>
          )}
          {user?.role === 'student' && (
            <Button variant="contained" size="small" onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? 'Kaydediliyor...' : 'Derse Kaydol'}
            </Button>
          )}
        </Stack>
      </Stack>

      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" color="text.secondary">
                Ders
              </Typography>
              <Typography>{section.course?.name || '-'}</Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" color="text.secondary">
                Kapasite
              </Typography>
              <Typography>
                {section.enrolled_count ?? '-'} / {section.capacity}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Eğitmen
              </Typography>
              <Typography>
                {section.instructor
                  ? `${section.instructor.first_name || ''} ${section.instructor.last_name || ''}`
                  : '-'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Sınıf
              </Typography>
              <Typography>
                {section.classroom
                  ? `${section.classroom.building || ''} ${section.classroom.room_number || ''}`.trim()
                  : '-'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" mb={1}>
            Ders Programı
          </Typography>
          {schedule.length ? (
            <Stack spacing={1}>
              {schedule.map((item, idx) => (
                <Stack
                  key={`${item.day}-${item.start_time}-${idx}`}
                  direction="row"
                  spacing={2}
                  divider={<Box sx={{ borderLeft: '1px solid', borderColor: 'divider', height: '100%' }} />}
                >
                  <Typography width={140}>{item.day}</Typography>
                  <Typography>
                    {item.start_time} - {item.end_time}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">Program bilgisi yok.</Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}

export default SectionDetailPage;
