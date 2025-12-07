import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import PasswordInput from '../../components/form/PasswordInput';
import TextInput from '../../components/form/TextInput';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema } from '../../utils/validationSchemas';
import { getErrorMessage } from '../../utils/error';
import AuthLayout from '../../components/layout/AuthLayout';

type LoginForm = {
  email: string;
  password: string;
};

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit: SubmitHandler<LoginForm> = async (values) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await login(values);
      navigate('/dashboard');
    } catch (error) {
      setServerError(getErrorMessage(error, 'Giriş başarısız.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Tekrar hoş geldiniz"
      subtitle="Hesabınıza giriş yapın"
      action={
        <Link to="/register" className="text-sm text-blue-600 hover:underline">
          Hesabın yok mu?
        </Link>
      }
    >
      {serverError && <Alert variant="error" message={serverError} sx={{ mb: 2 }} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextInput
          label="Email"
          type="email"
          placeholder="ornek@kampus.com"
          register={register}
          name="email"
          error={errors.email?.message}
        />

        <PasswordInput
          label="Şifre"
          placeholder="********"
          register={register}
          name="password"
          error={errors.password?.message}
        />

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
          <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">
            Şifremi unuttum
          </Link>
        </Stack>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmitting}
          sx={{ mt: 3 }}
        >
          {isSubmitting ? <LoadingSpinner label="Giriş yapılıyor..." /> : 'Giriş yap'}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
