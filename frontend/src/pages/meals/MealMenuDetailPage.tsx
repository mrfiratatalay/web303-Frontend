import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Toast from '../../components/feedback/Toast';
import { useAuth } from '../../hooks/useAuth';
import { MealMenu } from '../../types/meals';
import { createMealReservation, extractData, getMealMenuById } from '../../services/mealApi';
import { getErrorMessage } from '../../utils/error';

function MealMenuDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menu, setMenu] = useState<MealMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ open: boolean; message: string; type?: 'success' | 'info' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    const loadMenu = async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const response = await getMealMenuById(id);
        const data = extractData<MealMenu>(response);
        setMenu(data || null);
      } catch (err) {
        setError(getErrorMessage(err, 'Menü yüklenemedi.'));
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, [id]);

  const handleReserve = async () => {
    if (!id) return;
    setActionLoading(true);
    setError('');
    try {
      await createMealReservation({ menu_id: id });
      setToast({ open: true, message: 'Rezervasyon oluşturuldu.', type: 'success' });
    } catch (err) {
      const message = getErrorMessage(err, 'Rezervasyon başarısız.');
      setError(message);
      setToast({ open: true, message, type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box py={4}>
        <LoadingSpinner label="Menü yükleniyor..." />
      </Box>
    );
  }

  if (error || !menu) {
    return <Alert variant="error" message={error || 'Menü bulunamadı.'} />;
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="h5" fontWeight={800}>
          {menu.title || menu.name || 'Yemek menusu'}
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Geri Dön
        </Button>
      </Stack>

      {error && <Alert variant="error" message={error} />}

      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Typography color="text.secondary">Yemekhane</Typography>
            <Typography>{menu.cafeteria?.name || menu.cafeteria_id || '-'}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {menu.date && <Chip label={menu.date} size="small" />}
              {menu.start_time && <Chip label={menu.start_time} size="small" />}
              {menu.end_time && <Chip label={menu.end_time} size="small" />}
              {menu.status && <Chip label={menu.status} size="small" />}
            </Stack>
            {menu.description && (
              <Typography color="text.secondary">{menu.description}</Typography>
            )}
            <Typography fontWeight={700}>Fiyat: {menu.price ?? '-'}</Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} mb={1}>
            Menu icerigi
          </Typography>
          {(menu.items_json?.length || menu.items?.length) ? (
            <Stack spacing={1}>
              {(menu.items_json || menu.items || []).map((item, idx) => (
                <Stack key={item.id || idx} direction="row" justifyContent="space-between">
                  <Stack spacing={0.2}>
                    <Typography fontWeight={600}>{item.name}</Typography>
                    {item.description && (
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    )}
                  </Stack>
                  <Typography color="text.secondary">
                    {item.calories != null ? `${item.calories} cal` : ''}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
            <Typography color="text.secondary">Menu icerigi bulunamadi.</Typography>
          )}
        </CardContent>
      </Card>

      <Box>
        <Button
          variant="contained"
          onClick={user?.role === 'admin' ? () => navigate(`/admin/meals/menus/${id}`) : handleReserve}
          disabled={actionLoading}
        >
          {actionLoading
            ? <LoadingSpinner label={user?.role === 'admin' ? "Yukleniyor..." : "Rezervasyon yapiliyor..."} />
            : (user?.role === 'admin' ? 'Duzenle' : 'Rezerve et')
          }
        </Button>
      </Box>

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </Stack>
  );
}

export default MealMenuDetailPage;
