import { Box, Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ReactNode } from 'react';

type EmptyStateVariant = 'default' | 'search' | 'error' | 'noData' | 'success';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

// SVG Illustrations for each variant
const illustrations: Record<EmptyStateVariant, ReactNode> = {
  default: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#EEF2FF" />
      <path d="M40 70C40 70 48 80 60 80C72 80 80 70 80 70" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" />
      <circle cx="45" cy="50" r="5" fill="#6366F1" />
      <circle cx="75" cy="50" r="5" fill="#6366F1" />
      <path d="M30 35L35 40M90 35L85 40" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  search: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="55" cy="55" r="35" fill="#EEF2FF" stroke="#6366F1" strokeWidth="3" />
      <line x1="80" y1="80" x2="100" y2="100" stroke="#6366F1" strokeWidth="4" strokeLinecap="round" />
      <path d="M45 55H65M55 45V65" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  error: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#FEF2F2" />
      <path d="M45 45L75 75M75 45L45 75" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="60" r="40" stroke="#FCA5A5" strokeWidth="2" strokeDasharray="5 5" />
    </svg>
  ),
  noData: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="30" width="70" height="60" rx="8" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2" />
      <line x1="35" y1="50" x2="85" y2="50" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" />
      <line x1="35" y1="60" x2="70" y2="60" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" />
      <line x1="35" y1="70" x2="60" y2="70" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" />
      <circle cx="85" cy="75" r="15" fill="#F0FDF4" stroke="#22C55E" strokeWidth="2" />
      <path d="M80 75L83 78L90 71" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  success: (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#F0FDF4" />
      <path d="M40 60L55 75L85 45" stroke="#22C55E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="60" cy="60" r="40" stroke="#86EFAC" strokeWidth="2" />
    </svg>
  ),
};

const EmptyState = ({
  variant = 'default',
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  icon,
}: EmptyStateProps) => {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{
        py: 6,
        px: 3,
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease-out',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {/* Illustration */}
      <Box
        sx={{
          mb: 1,
          animation: 'float 3s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-8px)' },
          },
        }}
      >
        {icon || illustrations[variant]}
      </Box>

      {/* Title */}
      <Typography
        variant="h6"
        fontWeight={700}
        color="text.primary"
        sx={{ maxWidth: 300 }}
      >
        {title}
      </Typography>

      {/* Description */}
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 320, lineHeight: 1.6 }}
        >
          {description}
        </Typography>
      )}

      {/* Action Button */}
      {(actionTo || onAction) && actionLabel && (
        <Box sx={{ mt: 1 }}>
          {actionTo ? (
            <Button
              component={RouterLink}
              to={actionTo}
              variant="contained"
              size="medium"
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {actionLabel}
            </Button>
          ) : (
            <Button
              onClick={onAction}
              variant="contained"
              size="medium"
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              {actionLabel}
            </Button>
          )}
        </Box>
      )}
    </Stack>
  );
};

export default EmptyState;
