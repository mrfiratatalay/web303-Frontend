import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { strings } from '../../strings';

type Props = { children: ReactNode };
type State = { hasError: boolean; message?: string };

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || strings.errors.boundary.unexpected };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI error caught by ErrorBoundary:', error, info);
  }

  handleReload = () => window.location.reload();

  render() {
    if (this.state.hasError) {
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
                {strings.errors.boundary.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {this.state.message || strings.errors.boundary.description}
              </Typography>
              <Button variant="contained" onClick={this.handleReload}>
                {strings.errors.boundary.reload}
              </Button>
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
