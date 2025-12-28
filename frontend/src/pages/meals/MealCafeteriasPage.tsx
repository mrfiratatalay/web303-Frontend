import { useEffect, useState } from 'react';
import {
  Box,
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
import { Cafeteria } from '../../types/meals';
import { extractData, getCafeterias } from '../../services/mealApi';
import { getErrorMessage } from '../../utils/error';

function MealCafeteriasPage() {
  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCafeterias = async () => {
      setLoading(true);
      setError('');
    try {
      const response = await getCafeterias();
      const data = extractData<Cafeteria[] | Cafeteria>(response);
      setCafeterias(Array.isArray(data) ? data : data ? [data] : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Yemekhaneler yüklenemedi.'));
      setCafeterias([]);
    } finally {
      setLoading(false);
    }
  };
    loadCafeterias();
  }, []);

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Yemekhaneler
      </Typography>

      {error && <Alert variant="error" message={error} />}

      {loading ? (
        <Box py={4}>
          <LoadingSpinner label="Yemekhaneler yükleniyor..." />
        </Box>
      ) : (
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ad</TableCell>
                    <TableCell>Konum</TableCell>
                    <TableCell>Saatler</TableCell>
                    <TableCell align="right">Kapasite</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cafeterias.map((cafeteria) => (
                    <TableRow key={cafeteria.id}>
                      <TableCell>{cafeteria.name}</TableCell>
                      <TableCell>{cafeteria.location || '-'}</TableCell>
                      <TableCell>{cafeteria.open_hours || '-'}</TableCell>
                      <TableCell align="right">{cafeteria.capacity ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                  {!cafeterias.length && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography color="text.secondary">Yemekhane bulunamadı.</Typography>
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

export default MealCafeteriasPage;
