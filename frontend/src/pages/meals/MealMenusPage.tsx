import { useEffect, useMemo, useState } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { Cafeteria, MealMenu, MealMenuListQuery } from '../../types/meals';
import {
  extractData,
  getCafeterias,
  getMealMenus,
  normalizeMealMenuListResponse,
} from '../../services/mealApi';
import { getErrorMessage } from '../../utils/error';

const DEFAULT_QUERY: MealMenuListQuery = {
  page: 1,
  limit: 20,
};

function MealMenusPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState<MealMenuListQuery>(DEFAULT_QUERY);
  const [menus, setMenus] = useState<MealMenu[]>([]);
  const [cafeterias, setCafeterias] = useState<Cafeteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const loadCafeterias = async () => {
      try {
        const response = await getCafeterias();
        const data = extractData<Cafeteria[] | Cafeteria>(response);
        setCafeterias(Array.isArray(data) ? data : data ? [data] : []);
      } catch {
        setCafeterias([]);
      }
    };
    loadCafeterias();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery((prev) => ({ ...prev, page: 1, search: searchInput.trim() || undefined }));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const loadMenus = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getMealMenus(query);
        const data = normalizeMealMenuListResponse(response, { page: query.page, limit: query.limit });
        setMenus(data.menus);
    } catch (err) {
      setError(getErrorMessage(err, 'Menuler yuklenemedi.'));
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };
    loadMenus();
  }, [query]);

  const cafeteriaOptions = useMemo(
    () => [{ id: '', name: 'Tum yemekhaneler' }, ...cafeterias],
    [cafeterias],
  );

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Yemek menuleri
      </Typography>

      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              fullWidth
              size="small"
              label="Ara"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Menu basligi"
            />
            <TextField
              select
              size="small"
              label="Yemekhane"
              SelectProps={{ native: true }}
              value={query.cafeteria_id || ''}
              onChange={(e) => setQuery((prev) => ({ ...prev, page: 1, cafeteria_id: e.target.value || undefined }))}
            >
              {cafeteriaOptions.map((cafeteria) => (
                <option key={cafeteria.id} value={cafeteria.id}>
                  {cafeteria.name}
                </option>
              ))}
            </TextField>
            <Button variant="outlined" size="small" onClick={() => setQuery(DEFAULT_QUERY)}>
              Sifirla
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert variant="error" message={error} />}

      {loading ? (
        <Box py={4}>
          <LoadingSpinner label="Menuler yukleniyor..." />
        </Box>
      ) : (
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Menu</TableCell>
                    <TableCell>Yemekhane</TableCell>
                    <TableCell>Tarih</TableCell>
                    <TableCell align="right">Fiyat</TableCell>
                    <TableCell align="right">Islem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {menus.map((menu) => (
                    <TableRow key={menu.id}>
                      <TableCell>{menu.title || menu.name || 'Menu'}</TableCell>
                      <TableCell>{menu.cafeteria?.name || menu.cafeteria_id || '-'}</TableCell>
                      <TableCell>{menu.date || menu.start_time || '-'}</TableCell>
                      <TableCell align="right">{menu.price ?? '-'}</TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => navigate(`/meals/menus/${menu.id}`)}>
                          Detay
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!menus.length && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">Menu bulunamadi.</Typography>
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

export default MealMenusPage;
