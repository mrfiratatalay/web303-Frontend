import { ReactNode } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  maxWidth?: number | string;
};

function AuthLayout({ title, subtitle, action, children, maxWidth = 480 }: Props) {
  return (
    <Box
      className="min-h-screen flex items-center justify-center px-4"
      sx={{
        background: `linear-gradient(135deg, rgba(59,130,246,0.06), rgba(14,165,233,0.03)),
                     radial-gradient(120% 120% at 20% 20%, rgba(15,23,42,0.04), transparent 45%),
                     #f8fafc`,
      }}
    >
      <Paper
        elevation={4}
        className="w-full"
        sx={{
          maxWidth,
          width: '100%',
          p: { xs: 3.5, sm: 4 },
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 18px 38px rgba(15,23,42,0.08)',
          backdropFilter: 'blur(3px)',
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" fontWeight={800} letterSpacing={-0.4}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" mt={0.75}>
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box>{children}</Box>

          {action && (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {action}
            </Typography>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

export default AuthLayout;
