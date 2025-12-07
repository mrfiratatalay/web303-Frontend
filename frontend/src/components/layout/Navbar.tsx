import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #1d4ed8, #2563eb, #0ea5e9)',
        color: 'white',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 36, height: 36 }}>SC</Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Smart Campus
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Authentication & User
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          {user ? (
            <>
              <Box textAlign="right">
                <Typography variant="body2" fontWeight={700}>
                  {user.first_name || user.firstName} {user.last_name || user.lastName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  {user.role}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={logout}
                sx={{ borderColor: 'rgba(255,255,255,0.7)' }}
              >
                Çıkış yap
              </Button>
            </>
          ) : (
            <>
              <Button component={RouterLink} to="/login" color="inherit" variant="outlined" size="small">
                Giriş
              </Button>
              <Button component={RouterLink} to="/register" color="inherit" variant="contained" size="small">
                Kayıt ol
              </Button>
            </>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
