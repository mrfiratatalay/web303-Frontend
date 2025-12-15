import { useEffect, useState } from 'react';
import {
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
  Box,
} from '@mui/material';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Alert from '../../components/feedback/Alert';
import { ScheduleEntry } from '../../types/academics';
import { extractData, getMySchedule } from '../../services/enrollmentApi';
import { getErrorMessage } from '../../utils/error';

function StudentSchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getMySchedule();
        const raw = extractData<any>(response);
        if (Array.isArray(raw)) {
          const flattened: ScheduleEntry[] = [];
          raw.forEach((day: any) => {
            if (Array.isArray(day?.slots)) {
              day.slots.forEach((slot: any) =>
                flattened.push({
                  courseCode: slot.courseCode,
                  courseName: slot.courseName,
                  sectionNumber: slot.sectionNumber,
                  day: day.day,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  classroom: slot.classroom,
                }),
              );
            }
          });
          setSchedule(flattened);
        } else {
          setSchedule([]);
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Ders programı yüklenemedi.'));
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Programım
      </Typography>
      {error && <Alert variant="error" message={error} />}
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
                    <TableCell>Ders</TableCell>
                    <TableCell>Şube</TableCell>
                    <TableCell>Gün</TableCell>
                    <TableCell>Saat</TableCell>
                    <TableCell>Sınıf</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedule.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.courseCode}</TableCell>
                      <TableCell>{item.sectionNumber}</TableCell>
                      <TableCell>{item.day}</TableCell>
                      <TableCell>
                        {item.startTime} - {item.endTime}
                      </TableCell>
                      <TableCell>{item.classroom || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {!schedule.length && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">Kayıt bulunamadı.</Typography>
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

export default StudentSchedulePage;

