import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockRegister = vi.hoisted(() => vi.fn().mockResolvedValue({ data: { message: 'ok' } }));
const mockNavigate = vi.hoisted(() => vi.fn());
const mockGet = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ data: { data: [{ id: 'dept-1', name: 'Bilgisayar Mühendisliği' }] } }),
);

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

vi.mock('../services/authApi', () => ({
  register: mockRegister,
}));

vi.mock('../services/apiClient', () => ({
  __esModule: true,
  default: {
    get: mockGet,
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate(),
  };
});

import RegisterPage from '../pages/auth/RegisterPage';

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders main fields', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/isim/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/soyisim/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-posta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^şifre$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifre tekrar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rol/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bölüm/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/öğrenci numarası/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/kullanım şartlarını kabul ediyorum/i)).toBeInTheDocument();
  });

  it('shows validation errors when required fields are empty', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    await userEvent.click(screen.getByRole('button', { name: /hesap oluştur/i }));

    expect(await screen.findByText(/isim zorunludur/i)).toBeInTheDocument();
    expect(await screen.findByText(/soyisim zorunludur/i)).toBeInTheDocument();
    expect(await screen.findByText(/email zorunludur/i)).toBeInTheDocument();
    expect(await screen.findByText(/bölüm seçimi zorunludur/i)).toBeInTheDocument();
    // Password may fail with required or min-length; accept either
    expect(await screen.findByText(/şifre (zorunludur|en az 8 karakter olmalıdır)/i)).toBeInTheDocument();
    expect(await screen.findByText(/şifre tekrar (zorunludur|eşleşmiyor|en az 8)/i)).toBeInTheDocument();
    expect(await screen.findByText(/öğrenci numarası zorunludur/i)).toBeInTheDocument();
    expect(await screen.findByText(/kullanım şartlarını onaylayın/i)).toBeInTheDocument();
  });

  it('shows password mismatch error', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByLabelText(/isim/i), 'Ali');
    await userEvent.type(screen.getByLabelText(/soyisim/i), 'Veli');
    await userEvent.type(screen.getByLabelText(/e-posta/i), 'ali@example.com');
    await userEvent.type(screen.getByLabelText(/^şifre$/i), 'Password1');
    await userEvent.type(screen.getByLabelText(/şifre tekrar/i), 'Password2');
    await userEvent.type(screen.getByLabelText(/öğrenci numarası/i), '123456');

    await userEvent.click(screen.getByLabelText(/bölüm/i));
    const option = await screen.findByRole('option', { name: /bilgisayar mühendisliği/i });
    await userEvent.click(option);

    await userEvent.click(screen.getByLabelText(/kullanım şartlarını kabul ediyorum/i));
    await userEvent.click(screen.getByRole('button', { name: /hesap oluştur/i }));

    expect(await screen.findByText(/şifreler eşleşmiyor/i)).toBeInTheDocument();
  });
});
