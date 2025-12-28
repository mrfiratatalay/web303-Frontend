import { IconButton, Tooltip, Box } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useThemeMode } from '../../contexts/ThemeContext';

const ThemeToggle = () => {
  const { mode, toggleTheme, isDark } = useThemeMode();

  return (
    <Tooltip title={isDark ? 'Açık Mod' : 'Karanlık Mod'} arrow>
      <IconButton
        onClick={toggleTheme}
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: 'action.hover',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: 'action.selected',
            transform: 'rotate(15deg)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeScale 0.3s ease',
            '@keyframes fadeScale': {
              from: { opacity: 0, transform: 'scale(0.5) rotate(-45deg)' },
              to: { opacity: 1, transform: 'scale(1) rotate(0deg)' },
            },
          }}
          key={mode} // Force re-render animation on mode change
        >
          {isDark ? (
            <LightModeIcon sx={{ color: '#fbbf24', fontSize: 22 }} />
          ) : (
            <DarkModeIcon sx={{ color: '#64748b', fontSize: 22 }} />
          )}
        </Box>
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;

