import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../components/form/PasswordInput', () => ({
  __esModule: true,
  default: ({
    label,
    name,
    register,
    error,
    ...props
  }: {
    label: string;
    name: string;
    register?: any;
    error?: string;
  }) => {
    const reg = register ? register(name) : {};
    return (
      <div>
        <input aria-label={label} name={name} {...reg} {...props} />
        {error ? <span>{error}</span> : null}
      </div>
    );
  },
}));

import LoginPage from '../pages/auth/LoginPage';

const mockLogin = vi.fn().mockResolvedValue(null);
const mockNavigate = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: false,
    error: null,
    login: mockLogin,
    logout: vi.fn(),
    setUser: vi.fn(),
    loadCurrentUser: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders email, password and submit button', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/e-posta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifre/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /giriş yap/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitted empty', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('button', { name: /giriş yap/i }));

    expect(await screen.findByText(/email zorunludur/i)).toBeInTheDocument();
    expect(await screen.findByText(/şifre zorunludur/i)).toBeInTheDocument();
  });

  it('shows invalid email format error', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByLabelText(/e-posta/i), 'not-an-email');
    await userEvent.type(screen.getByLabelText(/şifre/i), 'Password1');
    await userEvent.click(screen.getByRole('button', { name: /giriş yap/i }));

    expect(await screen.findByText(/geçerli bir email girin/i)).toBeInTheDocument();
  });

  it('calls login and redirects on success', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByLabelText(/e-posta/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/şifre/i), 'Password1');
    await userEvent.click(screen.getByRole('button', { name: /giriş yap/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalled());
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
  });
});
