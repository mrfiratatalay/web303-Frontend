import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, Checkbox, FormControlLabel, Stack } from '@mui/material';
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
  remember: boolean;
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
    defaultValues: { email: '', password: '', remember: false },
  });

  const onSubmit: SubmitHandler<LoginForm> = async ({ remember: _remember, ...credentials }) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      await login(credentials);
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
        <>
          {strings.auth.login.cta}{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            {strings.navbar.register}
          </Link>
        </>
      }
    >
      <Stack spacing={2}>
        {serverError && <Alert variant="error" message={serverError} />}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2}>
            <TextInput
              label={strings.auth.login.emailLabel}
              type="email"
              placeholder={strings.auth.login.emailPlaceholder}
              register={register}
              name="email"
              error={errors.email?.message}
              margin="none"
            />

            <PasswordInput
              label={strings.auth.login.passwordLabel}
              placeholder={strings.auth.login.passwordPlaceholder}
              register={register}
              name="password"
              error={errors.password?.message}
              margin="none"
            />

            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <FormControlLabel
                control={<Checkbox {...register('remember')} size="small" color="primary" />}
                label={strings.auth.login.remember}
                sx={{ ml: -0.5 }}
              />
              <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">
                {strings.auth.login.forgot}
              </Link>
            </Stack>

            <Button
              type="submit"
              fullWidth
              size="large"
              variant="contained"
              disabled={isSubmitting}
              sx={{ mt: 0.5 }}
            >
              {isSubmitting ? <LoadingSpinner label={strings.auth.login.submitting} /> : strings.auth.login.submit}
            </Button>
          </Stack>
        </Box>
      </Stack>
    </AuthLayout>
  );
}

export default LoginPage;
