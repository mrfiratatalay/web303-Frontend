import SchoolIcon from '@mui/icons-material/School';
import { Box, Container, Link, Stack, Typography } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth={false}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          {/* Logo and Copyright */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <SchoolIcon sx={{ color: 'primary.main', fontSize: 24 }} />
            <Typography variant="body2" color="text.secondary">
              © {currentYear} Smart Campus. Tüm hakları saklıdır.
            </Typography>
          </Stack>

          {/* Links */}
          <Stack direction="row" spacing={3}>
            <Link
              href="#"
              underline="hover"
              color="text.secondary"
              sx={{
                fontSize: '0.875rem',
                transition: 'color 0.2s',
                '&:hover': { color: 'primary.main' },
              }}
            >
              Gizlilik Politikası
            </Link>
            <Link
              href="#"
              underline="hover"
              color="text.secondary"
              sx={{
                fontSize: '0.875rem',
                transition: 'color 0.2s',
                '&:hover': { color: 'primary.main' },
              }}
            >
              Kullanım Şartları
            </Link>
            <Link
              href="#"
              underline="hover"
              color="text.secondary"
              sx={{
                fontSize: '0.875rem',
                transition: 'color 0.2s',
                '&:hover': { color: 'primary.main' },
              }}
            >
              İletişim
            </Link>
          </Stack>

          {/* Version */}
          <Typography variant="caption" color="text.disabled">
            v1.0.0
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
