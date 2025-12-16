import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      sx={{ bgcolor: '#f8fafc' }}
    >
      <Navbar onMenuClick={() => setMobileNavOpen(true)} />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <Box display="flex" flex={1} sx={{ width: '100%', minWidth: 0 }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            width: isMdUp ? 'calc(100% - 236px)' : '100%',
            ml: isMdUp ? '236px' : 0,
            maxWidth: 1440,
            px: { xs: 2, md: 3 },
            py: 4,
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;
