import React from 'react';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import MuiAlert, { AlertColor } from '@mui/material/Alert';

type ToastProps = {
  open: boolean;
  onClose: (event?: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => void;
  type?: AlertColor;
  message: string;
  autoHideDuration?: number;
};

function Toast({ open, onClose, type = 'info', message, autoHideDuration = 4000 }: ToastProps) {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={autoHideDuration}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <MuiAlert onClose={onClose} severity={type} variant="filled" sx={{ width: '100%' }}>
        {message}
      </MuiAlert>
    </Snackbar>
  );
}

export default Toast;
