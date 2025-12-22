import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

interface LoadingSpinnerProps {
  label?: string;
}

function LoadingSpinner({ label }: LoadingSpinnerProps) {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
      <CircularProgress size={20} />
      {label && (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      )}
    </Box>
  );
}

export default LoadingSpinner;
