import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import TextInput from '../../components/form/TextInput';
import { forgotPassword } from '../../services/authApi';
import { getErrorMessage } from '../../utils/error';
import { forgotPasswordSchema } from '../../utils/validationSchemas';
import AuthLayout from '../../components/layout/AuthLayout';

type ForgotForm = {
  email: string;
};

function ForgotPasswordPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit: SubmitHandler<ForgotForm> = async ({ email }) => {
    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setMessage('Eğer bu email kayıtlıysa, şifre sıfırlama linki gönderildi.');
    } catch (err) {
      setError(getErrorMessage(err, 'İşlem sırasında bir hata oluştu.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Şifre Sıfırlama"
      subtitle="Email adresinizi girin, kayıtlıysa sıfırlama linki gönderilecektir."
    >
      <Stack spacing={1.5}>
        {message && <Alert variant="success" message={message} />}
        {error && <Alert variant="error" message={error} />}
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextInput
          label="Email"
          name="email"
          type="email"
          register={register}
          error={errors.email?.message}
          placeholder="ornek@kampus.com"
        />
        <Button type="submit" fullWidth variant="contained" disabled={isSubmitting} sx={{ mt: 3 }}>
          {isSubmitting ? <LoadingSpinner label="Gönderiliyor..." /> : 'Sıfırlama linki gönder'}
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

export default ForgotPasswordPage;
