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
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { ScheduleEntry } from '../../types/scheduling';
import { downloadMyScheduleIcal, extractData, getMySchedule } from '../../services/schedulingApi';
import { getErrorMessage } from '../../utils/error';

const dayNameTurkish: Record<string, string> = {
  Monday: 'Pazartesi',
  Tuesday: 'Salı',
  Wednesday: 'Çarşamba',
  Thursday: 'Perşembe',
  Friday: 'Cuma',
  Saturday: 'Cumartesi',
  Sunday: 'Pazar',
  Pazartesi: 'Pazartesi',
  Salı: 'Salı',
  Çarşamba: 'Çarşamba',
  Perşembe: 'Perşembe',
  Cuma: 'Cuma',
  Cumartesi: 'Cumartesi',
  Pazar: 'Pazar',
};

const formatDay = (day: string | undefined | null): string => {
  if (!day) return '-';
  return dayNameTurkish[day] || day;
};

const normalizeEntries = (raw: any): ScheduleEntry[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    if (raw.length && raw[0]?.day && Array.isArray(raw[0]?.slots)) {
      const flattened: ScheduleEntry[] = [];
      raw.forEach((dayBlock) => {
        dayBlock.slots.forEach((slot: any) => {
          flattened.push({
            day: dayBlock.day,
            start_time: slot.start_time || slot.startTime,
            end_time: slot.end_time || slot.endTime,
            course_code: slot.course_code || slot.courseCode,
            course_name: slot.course_name || slot.courseName,
            section_number: slot.section_number || slot.sectionNumber,
            classroom: slot.classroom,
          });
        });
      });
      return flattened;
    }

    return raw.map((entry) => ({
      id: entry.id,
      day: entry.day_name || entry.day,
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

function MySchedulePage() {
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getMySchedule();
        const data = extractData<any>(response);
        setEntries(normalizeEntries(data));
      } catch (err) {
        setError(getErrorMessage(err, 'Program yüklenemedi.'));
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      const response = await downloadMyScheduleIcal();
      const blob = response.data as Blob;
      let filename = 'schedule.ics';
      const disposition = response.headers?.['content-disposition'];
      if (disposition) {
        const match = /filename=([^;]+)/i.exec(disposition);
        if (match && match[1]) {
          filename = match[1].trim().replace(/"/g, '');
        }
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err, 'iCal indirme başarısız.'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight={800}>
          Programim
        </Typography>
        <Button variant="contained" onClick={handleDownload} disabled={downloading}>
          {downloading ? 'Indiriliyor...' : 'iCal indir'}
        </Button>
      </Stack>

      {error && <Alert variant="error" message={error} />}

      {loading ? (
        <Box py={4}>
          <LoadingSpinner label="Program yükleniyor..." />
        </Box>
      ) : (
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
                      <TableCell>{formatDay(item.day)}</TableCell>
                      <TableCell>
                        {item.start_time || '-'} {item.end_time ? `- ${item.end_time}` : ''}
                      </TableCell>
                      <TableCell>{item.classroom || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {!entries.length && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">Program kaydı bulunamadı.</Typography>
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

export default MySchedulePage;
