import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock MUI icons to avoid loading many icon modules in tests (reduces file handles)
vi.mock('@mui/icons-material/Visibility', () => ({
  __esModule: true,
  default: () => null,
}));
vi.mock('@mui/icons-material/VisibilityOff', () => ({
  __esModule: true,
  default: () => null,
}));

// Catch-all mock for icons to prevent EMFILE on Windows during tests
vi.mock('@mui/icons-material', () => {
  return new Proxy(
    {},
    {
      get:
        () =>
        () =>
          null,
    },
  );
});
