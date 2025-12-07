import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function Layout() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      sx={{ bgcolor: '#f8fafc' }}
    >
      <Navbar />
      <Box display="flex" flex={1}>
        <Sidebar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}

export default Layout;
