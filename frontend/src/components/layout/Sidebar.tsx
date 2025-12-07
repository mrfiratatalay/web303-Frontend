import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile', label: 'Profil' },
];

function Sidebar() {
  return (
    <Box
      component="aside"
      className="hidden md:block"
      sx={{ width: 220, borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    >
      <List>
        {navItems.map((item) => (
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
