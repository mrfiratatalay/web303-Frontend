import { useState } from 'react';
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
  TextField,
  Typography,
  MenuItem,
} from '@mui/material';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { ExcuseRequest } from '../../types/academics';
import { approveExcuse, extractData, getExcuseRequests, rejectExcuse } from '../../services/attendanceApi';
import { getErrorMessage } from '../../utils/error';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
};

function FacultyExcusesPage() {
  const [status, setStatus] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [data, setData] = useState<ExcuseRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getExcuseRequests({
        status: status || undefined,
        section_id: sectionId || undefined,
      });
      const list = extractData<ExcuseRequest[]>(response);
      setData(list || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Mazeretler alınamadı.'));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id: string, action: 'approve' | 'reject') => {
    setError('');
    setMessage('');
    try {
      if (action === 'approve') {
        await approveExcuse(id);
        setMessage('Mazeret onaylandı.');
      } else {
        await rejectExcuse(id);
        setMessage('Mazeret reddedildi.');
      }
      load();
    } catch (err) {
      setError(getErrorMessage(err, 'İşlem başarısız.'));
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Mazeret Talepleri
      </Typography>
      {message && <Alert variant="success" message={message} />}
      {error && <Alert variant="error" message={error} />}

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              select
              label="Durum"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
            >
              <MenuItem value="">Tümü</MenuItem>
              <MenuItem value="pending">Beklemede</MenuItem>
              <MenuItem value="approved">Onaylandı</MenuItem>
              <MenuItem value="rejected">Reddedildi</MenuItem>
            </TextField>
            <TextField
              label="Şube ID (isteğe bağlı)"
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={load} disabled={loading}>
              Yükle
            </Button>
          </Stack>
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
                    <TableCell>Öğrenci</TableCell>
                    <TableCell>Ders/Şube</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Belge</TableCell>
                    <TableCell align="right">İşlem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.student?.user?.first_name} {item.student?.user?.last_name}
                      </TableCell>
                      <TableCell>{item.session?.section?.course?.code}</TableCell>
                      <TableCell>{STATUS_LABELS[item.status] || item.status}</TableCell>
                      <TableCell>
                        {item.document_url ? (
                          <Button component="a" href={item.document_url} target="_blank" rel="noreferrer" size="small">
                            Görüntüle
                          </Button>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleDecision(item.id, 'approve')}
                            disabled={item.status !== 'pending'}
                          >
                            Onayla
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => handleDecision(item.id, 'reject')}
                            disabled={item.status !== 'pending'}
                          >
                            Reddet
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!data.length && (
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

export default FacultyExcusesPage;

