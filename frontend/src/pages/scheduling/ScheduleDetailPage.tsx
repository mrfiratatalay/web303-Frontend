import { useEffect, useState } from 'react';
import {
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
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { Schedule, ScheduleEntry } from '../../types/scheduling';
import { extractData, getScheduleById } from '../../services/schedulingApi';
import { getErrorMessage } from '../../utils/error';

const normalizeEntries = (raw: any): ScheduleEntry[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((entry) => ({
      id: entry.id,
      day: entry.day,
      start_time: entry.start_time || entry.startTime,
      end_time: entry.end_time || entry.endTime,
      course_code: entry.course_code || entry.courseCode || entry.course?.code,
      course_name: entry.course_name || entry.courseName || entry.course?.name,
      section_number: entry.section_number || entry.sectionNumber,
      classroom: entry.classroom || entry.classroom_name,
      instructor: entry.instructor || entry.instructor_name,
    }));
  }

  const entries = raw.entries || raw.schedule?.entries;
  if (Array.isArray(entries)) {
    return normalizeEntries(entries);
  }

  return [];
};

function ScheduleDetailPage() {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!scheduleId) return;
      setLoading(true);
      setError('');
    try {
      const response = await getScheduleById(scheduleId);
      const data = extractData<Schedule>(response);
      setSchedule(data || null);
      setEntries(normalizeEntries(data));
    } catch (err) {
      setError(getErrorMessage(err, 'Program yuklenemedi.'));
    } finally {
      setLoading(false);
    }
  };
    load();
  }, [scheduleId]);

  if (loading) {
    return (
      <Box py={4}>
        <LoadingSpinner label="Program yukleniyor..." />
      </Box>
    );
  }

  if (error || !schedule) {
    return <Alert variant="error" message={error || 'Program bulunamadi.'} />;
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight={800}>
          Program detayi
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Geri
        </Button>
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Typography>Program ID: {schedule.id}</Typography>
            <Typography>Donem: {schedule.semester || '-'}</Typography>
            <Typography>Yil: {schedule.year ?? '-'}</Typography>
            <Typography>Olusturma: {schedule.generated_at || '-'}</Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ders</TableCell>
                  <TableCell>Sube</TableCell>
                  <TableCell>Gun</TableCell>
                  <TableCell>Saat</TableCell>
                  <TableCell>Derslik</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map((item, idx) => (
                  <TableRow key={item.id || idx}>
                    <TableCell>{item.course_code || '-'}</TableCell>
                    <TableCell>{item.section_number || '-'}</TableCell>
                    <TableCell>{item.day || '-'}</TableCell>
                    <TableCell>
                      {item.start_time || '-'} {item.end_time ? `- ${item.end_time}` : ''}
                    </TableCell>
                    <TableCell>{item.classroom || '-'}</TableCell>
                  </TableRow>
                ))}
                {!entries.length && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">Program kaydi bulunamadi.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default ScheduleDetailPage;
