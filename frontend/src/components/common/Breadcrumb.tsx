import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

// Route label mappings
const routeLabels: Record<string, string> = {
  dashboard: 'Ana Sayfa',
  profile: 'Profil',
  courses: 'Dersler',
  sections: 'Şubeler',
  enrollments: 'Kayıtlar',
  my: 'Benim',
  schedule: 'Program',
  grades: 'Notlar',
  transcript: 'Transkript',
  attendance: 'Yoklama',
  checkin: 'Giriş',
  excuse: 'Mazeret',
  review: 'İncele',
  sessions: 'Oturumlar',
  report: 'Rapor',
  meals: 'Yemekler',
  cafeterias: 'Yemekhaneler',
  menus: 'Menüler',
  reservations: 'Rezervasyonlar',
  events: 'Etkinlikler',
  'my-registrations': 'Kayıtlarım',
  wallet: 'Cüzdan',
  scheduling: 'Programlama',
  generate: 'Oluştur',
  admin: 'Yönetim',
  users: 'Kullanıcılar',
  new: 'Yeni',
  analytics: 'Analitik',
  academic: 'Akademik',
  meal: 'Yemek',
  event: 'Etkinlik',
  notifications: 'Bildirimler',
  preferences: 'Tercihler',
  faculty: 'Akademisyen',
  students: 'Öğrenciler',
  entry: 'Giriş',
  bulk: 'Toplu',
  'qr-use': 'QR Kullan',
};

interface BreadcrumbProps {
  customLabels?: Record<string, string>;
}

const Breadcrumb = ({ customLabels = {} }: BreadcrumbProps) => {
  const location = useLocation();

  const breadcrumbs = useMemo(() => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    
    // Don't show breadcrumb on dashboard (home page)
    if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
      return [];
    }

    return pathnames.map((value, index) => {
      const to = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      const label = customLabels[value] || routeLabels[value] || value.charAt(0).toUpperCase() + value.slice(1);

      return { to, label, isLast };
    });
  }, [location.pathname, customLabels]);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-ol': {
            alignItems: 'center',
          },
        }}
      >
        {/* Home link */}
        <Link
          component={RouterLink}
          to="/dashboard"
          underline="hover"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'text.secondary',
            transition: 'color 0.2s',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          <HomeIcon sx={{ fontSize: 18, mr: 0.5 }} />
          <Typography variant="body2">Ana Sayfa</Typography>
        </Link>

        {/* Dynamic breadcrumbs */}
        {breadcrumbs.map(({ to, label, isLast }) =>
          isLast ? (
            <Typography
              key={to}
              variant="body2"
              color="text.primary"
              fontWeight={600}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {label}
            </Typography>
          ) : (
            <Link
              key={to}
              component={RouterLink}
              to={to}
              underline="hover"
              sx={{
                color: 'text.secondary',
                transition: 'color 0.2s',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              <Typography variant="body2">{label}</Typography>
            </Link>
          )
        )}
      </Breadcrumbs>
    </Box>
  );
};

export default Breadcrumb;

