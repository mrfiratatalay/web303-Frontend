import { Grid, Paper, Stack, Typography, Chip, Divider } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const roleCopy: Record<string, string> = {
  student: 'Ogrenci paneliniz hazir. Dersler ve yoklama ozellikleri Part 2 ile acilacak.',
  faculty: 'Akademisyen paneli icin temel erisimler hazir.',
  admin: 'Yonetici ozetlerini burada gosterecegiz.',
};

const statCards = [
  {
    title: 'Kimlik Durumu',
    desc: 'Oturum acik, API entegrasyonu aktif.',
    gradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
  },
  {
    title: 'Sonraki Adimlar',
    desc: 'Part 2 ile ders planlama, yoklama ve diger moduller eklenecek.',
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  },
];

function DashboardPage() {
  const { user } = useAuth();

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(14,165,233,0.04))',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Chip label={(user?.role || '').toUpperCase()} color="primary" variant="outlined" />
          <Divider orientation="vertical" flexItem />
          <div>
            <Typography variant="h5" fontWeight={800} color="text.primary">
              Hos geldin, {user?.first_name || user?.firstName || 'kullanici'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {roleCopy[user?.role as string] || 'Rol bazli menuler burada gosterilecek.'}
            </Typography>
          </div>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {statCards.map((card) => (
          <Grid item xs={12} md={6} key={card.title}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                background: card.gradient,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                {card.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {card.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export default DashboardPage;
