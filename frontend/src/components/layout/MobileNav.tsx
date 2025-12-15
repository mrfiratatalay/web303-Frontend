import { NavLink } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LogoutIcon from '@mui/icons-material/Logout';
import { navSections } from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { strings } from '../../strings';

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

function MobileNav({ open, onClose }: MobileNavProps) {
  const { user, logout } = useAuth();
  const role = user?.role;

  const userName = user ? `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim() : '';
  const roleLabel = role ? strings.roles[role] || role : strings.common.userFallback;
  const initials = (user?.first_name || user?.firstName || 'U').charAt(0).toUpperCase();

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 300,
          p: 2,
          pt: 2.5,
          borderTopRightRadius: 12,
          borderBottomRightRadius: 12,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>{initials}</Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
              {userName || strings.common.userFallback}
            </Typography>
            <Chip
              label={roleLabel}
              size="small"
              variant="outlined"
              sx={{ height: 22, fontWeight: 700, mt: 0.25 }}
            />
          </Box>
        </Stack>
        <IconButton aria-label={strings.common.menuAriaLabel} onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      <Divider sx={{ mb: 1.5 }} />

      <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => !item.roles || (role && item.roles.includes(role)));
          if (!visibleItems.length) return null;

          return (
            <Box key={section.title} sx={{ mb: 1.5 }}>
              <Typography
                variant="overline"
                fontWeight={700}
                color="text.secondary"
                sx={{ px: 1, letterSpacing: 0.6, display: 'block', mb: 0.5 }}
              >
                {section.title}
              </Typography>
              <List disablePadding>
                {visibleItems.map((item) => (
                  <ListItemButton
                    key={item.to}
                    component={NavLink}
                    to={item.to}
                    onClick={onClose}
                    sx={{
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
                      mb: 0.5,
                      '&.active': {
                        bgcolor: 'primary.light',
                        color: 'primary.dark',
                        fontWeight: 700,
                        '& .MuiListItemIcon-root': { color: 'primary.main' },
                      },
                      '& .MuiListItemIcon-root': {
                        minWidth: 32,
                        color: 'text.secondary',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600, lineHeight: 1.4 }}
                    />
                  </ListItemButton>
                ))}
              </List>
              <Divider sx={{ mt: 1 }} />
            </Box>
          );
        })}
      </Box>

      <Button
        fullWidth
        variant="outlined"
        color="inherit"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{ mt: 1 }}
      >
        {strings.navbar.logout}
      </Button>
    </Drawer>
  );
}

export default MobileNav;

