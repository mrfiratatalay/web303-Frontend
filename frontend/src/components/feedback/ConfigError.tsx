import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { strings } from '../../strings';

type ConfigErrorProps = {
  onReload?: () => void;
};

function ConfigError({ onReload }: ConfigErrorProps) {
  const handleReload = () => {
    if (onReload) onReload();
    window.location.reload();
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ bgcolor: '#f8fafc', px: 2 }}
    >
      <Paper elevation={4} sx={{ maxWidth: 420, p: 3, borderRadius: 3 }}>
        <Stack spacing={1.5}>
          <Typography variant="h6" fontWeight={800}>
            {strings.errors.missingApiBase.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {strings.errors.missingApiBase.message}
          </Typography>
          <Button variant="contained" onClick={handleReload}>
            {strings.errors.missingApiBase.action}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default ConfigError;
