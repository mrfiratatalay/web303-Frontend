import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import PasswordInput from '../../components/form/PasswordInput';
import { resetPassword } from '../../services/authApi';
import { getErrorMessage } from '../../utils/error';
import { resetPasswordSchema } from '../../utils/validationSchemas';
import AuthLayout from '../../components/layout/AuthLayout';

type ResetForm = {
  password: string;
  confirmPassword: string;
};

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit: SubmitHandler<ResetForm> = async ({ password }) => {
    setMessage('');
    setError('');
    setIsSubmitting(true);
    try {
      await resetPassword({ token: token || '', password });
      setMessage('Şifreniz güncellendi. Giriş sayfasına yönlendiriliyorsunuz...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(getErrorMessage(err, 'Şifre güncellenemedi.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Yeni Şifre Belirle" subtitle="Güçlü bir şifre oluşturun.">
      <Stack spacing={1.5}>
        {message && <Alert variant="success" message={message} />}
        {error && <Alert variant="error" message={error} />}
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <PasswordInput
          label="Yeni Şifre"
          name="password"
          register={register}
          error={errors.password?.message}
          placeholder="********"
        />
        <PasswordInput
          label="Yeni Şifre Tekrar"
          name="confirmPassword"
          register={register}
          error={errors.confirmPassword?.message}
          placeholder="********"
        />

        <Button type="submit" fullWidth variant="contained" disabled={isSubmitting} sx={{ mt: 3 }}>
          {isSubmitting ? <LoadingSpinner label="Güncelleniyor..." /> : 'Şifreyi Güncelle'}
        </Button>
      </form>

      <Stack direction="row" justifyContent="flex-start" sx={{ mt: 2 }}>
        <Link to="/login" className="text-blue-600 hover:underline text-sm">
          Giriş sayfasına dön
        </Link>
      </Stack>
    </AuthLayout>
  );
}

export default ResetPasswordPage;
