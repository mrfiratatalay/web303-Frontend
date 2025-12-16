import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      sx={{ bgcolor: '#f8fafc' }}
    >
      <Navbar onMenuClick={() => setMobileNavOpen(true)} />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <Box display="flex" flex={1}>
        <Sidebar />
        <Container
          disableGutters
          maxWidth={false}
          sx={{
            width: '100%',
            maxWidth: 1440,
            py: 4,
            px: { xs: 2, lg: 3 },
            ml: 0,
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default Layout;
