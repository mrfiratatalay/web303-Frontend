import MuiAlert, { AlertColor } from '@mui/material/Alert';
import { SxProps, Theme } from '@mui/material/styles';
import React from 'react';

type Props = {
  variant?: AlertColor;
  title?: string;
  message?: string;
  children?: React.ReactNode;
  sx?: SxProps<Theme>;
};

function Alert({ variant = 'info', title, message, children, sx }: Props) {
  return (
    <MuiAlert severity={variant} sx={sx}>
      {title && <strong>{title}</strong>} {message || children}
    </MuiAlert>
  );
}

export default Alert;
