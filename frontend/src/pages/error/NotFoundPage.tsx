import { Link } from 'react-router-dom';
import { Box, Button, Typography, Stack } from '@mui/material';

function NotFoundPage() {
  return (
    <Box className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Box className="w-full max-w-lg rounded-xl bg-white p-8 shadow">
        <Stack spacing={2} alignItems="center">
          <Typography variant="h4" fontWeight={700}>
            404
          </Typography>
          <Typography variant="h6">Sayfa bulunamadi</Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Aradiginiz sayfa yok veya tasinmis olabilir.
          </Typography>
          <Button component={Link} to="/login" variant="contained">
            Giris sayfasina don
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default NotFoundPage;

