import { alpha, createTheme } from '@mui/material/styles';

const primaryMain = '#1f3d7a';
const primaryLight = '#2f5cc1';
const primaryDark = '#102347';
const secondaryMain = '#0ea5e9';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primaryMain,
      light: primaryLight,
      dark: primaryDark,
    },
    secondary: {
      main: secondaryMain,
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    fontWeightBold: 800,
    button: {
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: 0.1,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 14,
          transition: 'box-shadow 0.2s ease, background-color 0.2s ease, transform 0.15s ease',
          '&:focus-visible': {
            outline: 'none',
            boxShadow: `0 0 0 3px ${alpha(primaryMain, 0.3)}`,
          },
          '&:active': {
            transform: 'translateY(1px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});
