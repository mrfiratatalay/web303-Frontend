import React, { useMemo, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import { Link as RouterLink } from 'react-router-dom';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { useAuth } from '../../hooks/useAuth';
import { strings } from '../../strings';
import NotificationBadge from '../notifications/NotificationBadge';
import ThemeToggle from '../common/ThemeToggle';

type NavbarProps = {
  onMenuClick?: () => void;
};

function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const userName = useMemo(() => {
    if (!user) return '';
    return `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim();
  }, [user]);

  const roleLabel = useMemo(() => (user?.role ? strings.roles[user.role] || user.role : ''), [user?.role]);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#1f3d7a',
        backgroundImage: 'linear-gradient(90deg, #1f3d7a 0%, #2a4e9a 60%, #2f5cc1 100%)',
        color: 'white',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 10px 30px rgba(15,23,42,0.15)',
      }}
    >
      <Toolbar
        sx={{
          minHeight: 64,
          px: { xs: 2, md: 3 },
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1 }}>
          {user && (
            <IconButton
              aria-label={strings.common.openMenuLabel}
              onClick={onMenuClick}
              sx={{ display: { xs: 'inline-flex', md: 'none' }, color: 'white', mr: 0.5 }}
            >
              <MenuRoundedIcon />
            </IconButton>
          )}
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: 'rgba(255,255,255,0.14)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              letterSpacing: 0.4,
            }}
          >
            SC
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
              {strings.brand.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.78)' }}>
              {strings.brand.tagline}
            </Typography>
          </Box>
        </Stack>

        {user ? (
          <Stack direction="row" spacing={1.25} alignItems="center">
            <ThemeToggle />
            <NotificationBadge />
            <Box
              onClick={handleMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.25,
                py: 0.5,
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.18)',
                bgcolor: 'rgba(255,255,255,0.08)',
                cursor: 'pointer',
              }}
            >
              <Box textAlign="right">
                <Typography variant="body2" fontWeight={700} lineHeight={1.2}>
                  {userName || strings.common.userFallback}
                </Typography>
                <Chip
                  label={roleLabel}
                  size="small"
                  color="default"
                  variant="filled"
                  sx={{
                    height: 22,
                    fontSize: 12,
                    bgcolor: 'rgba(255,255,255,0.14)',
                    color: 'rgba(255,255,255,0.92)',
                  }}
                />
              </Box>
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'rgba(255,255,255,0.18)' }}>
                {(user.first_name || user.firstName || 'U')[0]}
              </Avatar>
              <IconButton
                size="small"
                sx={{ color: 'white', p: 0 }}
                aria-label={strings.common.userMenuLabel}
                onClick={handleMenuOpen}
              >
                <KeyboardArrowDownIcon />
              </IconButton>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>
                <PersonOutlineIcon fontSize="small" style={{ marginRight: 8 }} />
                {strings.navbar.profile}
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" style={{ marginRight: 8 }} />
                {strings.navbar.logout}
              </MenuItem>
            </Menu>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1} alignItems="center">
            <Button component={RouterLink} to="/login" color="inherit" variant="text" size="small">
              {strings.navbar.login}
            </Button>
            <Button component={RouterLink} to="/register" color="inherit" variant="outlined" size="small">
              {strings.navbar.register}
            </Button>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
