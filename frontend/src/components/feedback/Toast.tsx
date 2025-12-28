import React, { useEffect, useState } from 'react';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import MuiAlert, { AlertColor } from '@mui/material/Alert';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Slide, { SlideProps } from '@mui/material/Slide';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

type ToastProps = {
  open: boolean;
  onClose: (event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => void;
  type?: AlertColor;
  message: string;
  autoHideDuration?: number;
  showProgress?: boolean;
};

// Slide transition from right
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

// Custom icons for each severity
const iconMap: Record<AlertColor, React.ReactNode> = {
  success: <CheckCircleOutlineIcon />,
  error: <ErrorOutlineIcon />,
  warning: <WarningAmberIcon />,
  info: <InfoOutlinedIcon />,
};

function Toast({ 
  open, 
  onClose, 
  type = 'info', 
  message, 
  autoHideDuration = 4000,
  showProgress = true 
}: ToastProps) {
  const [progress, setProgress] = useState(100);

  // Reset progress when toast opens
  useEffect(() => {
    if (open && showProgress) {
      setProgress(100);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - (100 / (autoHideDuration / 100));
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [open, autoHideDuration, showProgress]);

  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={autoHideDuration}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
      sx={{
        '& .MuiSnackbarContent-root': {
          minWidth: 320,
        },
      }}
    >
      <Box
        sx={{
          minWidth: 320,
          maxWidth: 400,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        }}
      >
        <MuiAlert 
          onClose={onClose} 
          severity={type} 
          variant="filled" 
          icon={iconMap[type]}
          sx={{ 
            width: '100%',
            borderRadius: 0,
            py: 1.5,
            '& .MuiAlert-icon': {
              fontSize: 24,
            },
            '& .MuiAlert-message': {
              fontSize: '0.9rem',
              fontWeight: 500,
            },
          }}
        >
          {message}
        </MuiAlert>
        {showProgress && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 3,
              bgcolor: 'rgba(255,255,255,0.3)',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'rgba(255,255,255,0.8)',
                transition: 'transform 0.1s linear',
              },
            }}
          />
        )}
      </Box>
    </Snackbar>
  );
}

export default Toast;
