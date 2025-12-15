import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Stack } from '@mui/material';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import PasswordInput from '../../components/form/PasswordInput';
import TextInput from '../../components/form/TextInput';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema } from '../../utils/validationSchemas';
import { getErrorMessage } from '../../utils/error';
import AuthLayout from '../../components/layout/AuthLayout';
import { strings } from '../../strings';

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
      setServerError(getErrorMessage(error, strings.auth.login.error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={strings.auth.login.title}
      subtitle={strings.auth.login.subtitle}
      action={
        <Link to="/register" className="text-sm text-blue-600 hover:underline">
          {strings.auth.login.cta}
        </Link>
      }
    >
      {serverError && <Alert variant="error" message={serverError} sx={{ mb: 2 }} />}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextInput
          label={strings.auth.login.emailLabel}
          type="email"
          placeholder={strings.auth.login.emailPlaceholder}
          register={register}
          name="email"
          error={errors.email?.message}
        />

        <PasswordInput
          label={strings.auth.login.passwordLabel}
          placeholder={strings.auth.login.passwordPlaceholder}
          register={register}
          name="password"
          error={errors.password?.message}
        />

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
          <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">
            {strings.auth.login.forgot}
          </Link>
        </Stack>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={isSubmitting}
          sx={{ mt: 3 }}
        >
          {isSubmitting ? <LoadingSpinner label={strings.auth.login.submitting} /> : strings.auth.login.submit}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default LoginPage;
