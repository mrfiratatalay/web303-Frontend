import Box from '@mui/material/Box';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Breadcrumb from '../common/Breadcrumb';
import Footer from './Footer';
import MobileNav from './MobileNav';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);


  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      sx={{ bgcolor: 'background.default' }}
    >
      <Navbar onMenuClick={() => setMobileNavOpen(true)} />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <Box display="flex" flex={1} sx={{ width: '100%', minWidth: 0 }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: { xs: 2, md: 3 },
            py: 4,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box flex={1}>
            <Breadcrumb />
            <Outlet />
          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
}

export default Layout;
