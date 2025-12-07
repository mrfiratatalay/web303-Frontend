import { ReactNode } from 'react';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  maxWidth?: number | string;
};

function AuthLayout({ title, subtitle, action, children, maxWidth = '28rem' }: Props) {
  return (
    <Box
      className="min-h-screen flex items-center justify-center px-4"
      sx={{
        background: `radial-gradient(120% 120% at 20% 20%, rgba(37,99,235,0.10), transparent 40%),
                     radial-gradient(90% 90% at 80% 0%, rgba(14,165,233,0.12), transparent 45%),
                     #f8fafc`,
      }}
    >
      <Paper
        elevation={6}
        className="w-full"
        sx={{
          maxWidth,
          p: { xs: 4, md: 5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 20px 45px rgba(15,23,42,0.10)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={1}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <Chip label="Smart Campus" size="small" color="primary" variant="outlined" />
              <Chip label="Part 1" size="small" variant="filled" />
            </Stack>
            <Typography variant="h5" fontWeight={800} letterSpacing={-0.4}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Stack>

        <Box mt={3}>{children}</Box>
      </Paper>
    </Box>
  );
}

export default AuthLayout;
