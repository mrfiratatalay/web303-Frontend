import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile', label: 'Profil' },
  { to: '/courses', label: 'Dersler' },
  { to: '/admin/courses/new', label: 'Ders Yönetimi', roles: ['admin'] },
  { to: '/admin/users', label: 'Kullanıcılar', roles: ['admin'] },
];

function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  const visibleItems = navItems.filter((item) => !item.roles || (role && item.roles.includes(role)));

  return (
    <Box
      component="aside"
      className="hidden md:block"
      sx={{ width: 220, borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <List>
        {visibleItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            sx={{
              '&.active': { bgcolor: 'primary.light', color: 'primary.dark' },
            }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Divider />
    </Box>
  );
}

export default Sidebar;
