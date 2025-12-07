import React from 'react';
import MuiAlert, { AlertColor, AlertProps } from '@mui/material/Alert';

type Props = {
  variant?: AlertColor;
  title?: string;
  message?: string;
  children?: React.ReactNode;
} & Omit<AlertProps, 'severity'>;

function Alert({ variant = 'info', title, message, children, ...rest }: Props) {
  return (
    <MuiAlert severity={variant} {...rest}>
      {title && <strong>{title}</strong>} {message || children}
    </MuiAlert>
  );
}

export default Alert;
