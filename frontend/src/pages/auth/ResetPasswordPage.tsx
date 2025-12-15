import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import PasswordInput from '../../components/form/PasswordInput';
import { resetPassword } from '../../services/authApi';
import { getErrorMessage } from '../../utils/error';
import { resetPasswordSchema } from '../../utils/validationSchemas';
import AuthLayout from '../../components/layout/AuthLayout';
import { strings } from '../../strings';

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

  const onSubmit: SubmitHandler<ResetForm> = async ({ password, confirmPassword }) => {
    setMessage('');
    setError('');
    setIsSubmitting(true);
    try {
      await resetPassword({ token: token || '', password, confirmPassword });
      setMessage(strings.auth.resetPassword.success);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(getErrorMessage(err, strings.auth.resetPassword.error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title={strings.auth.resetPassword.title} subtitle={strings.auth.resetPassword.subtitle}>
      <Stack spacing={1.5}>
        {message && <Alert variant="success" message={message} />}
        {error && <Alert variant="error" message={error} />}
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <PasswordInput
          label={strings.auth.resetPassword.passwordLabel}
          name="password"
          register={register}
          error={errors.password?.message}
          placeholder={strings.auth.login.passwordPlaceholder}
        />
        <PasswordInput
          label={strings.auth.resetPassword.confirmLabel}
          name="confirmPassword"
          register={register}
          error={errors.confirmPassword?.message}
          placeholder={strings.auth.login.passwordPlaceholder}
        />

        <Button type="submit" fullWidth variant="contained" disabled={isSubmitting} sx={{ mt: 3 }}>
          {isSubmitting ? <LoadingSpinner label={strings.auth.resetPassword.submitting} /> : strings.auth.resetPassword.submit}
        </Button>
      </form>

      <Stack direction="row" justifyContent="flex-start" sx={{ mt: 2 }}>
        <Link to="/login" className="text-blue-600 hover:underline text-sm">
          {strings.auth.resetPassword.backToLogin}
        </Link>
      </Stack>
    </AuthLayout>
  );
}

export default ResetPasswordPage;
