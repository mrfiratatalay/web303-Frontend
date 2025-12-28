import { Box, Fade } from '@mui/material';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Wrapper component for smooth page transitions
 * Adds fade-in animation when page mounts
 */
const PageTransition = ({ children }: PageTransitionProps) => {
  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          animation: 'slideUp 0.3s ease-out',
          '@keyframes slideUp': {
            from: {
              opacity: 0,
              transform: 'translateY(10px)',
            },
            to: {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}
      >
        {children}
      </Box>
    </Fade>
  );
};

export default PageTransition;

