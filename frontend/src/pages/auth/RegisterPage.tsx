import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Grid,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import CheckboxInput from '../../components/form/CheckboxInput';
import PasswordInput from '../../components/form/PasswordInput';
import TextInput from '../../components/form/TextInput';
import { register as registerRequest } from '../../services/authApi';
import { getErrorMessage } from '../../utils/error';
import { registerSchema } from '../../utils/validationSchemas';
import AuthLayout from '../../components/layout/AuthLayout';

type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'faculty';
  departmentId: string;
  studentNumber?: string;
  employeeNumber?: string;
  title?: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

// Backend expects department UUIDs (seeded)
const departmentOptions = [
  { value: 'fca3dbca-08d6-41bd-8717-0f5223a6a016', label: 'Bilgisayar Mühendisliği' },
  { value: '3b96085f-1f0a-4bcb-b634-568b961ac969', label: 'Elektrik-Elektronik Mühendisliği' },
  { value: 'e31533d4-ec23-46ae-82f6-f719913abf9e', label: 'Makine Mühendisliği' },
  { value: 'c947f133-b288-4fd8-b05f-238586f6d767', label: 'İşletme' },
  { value: 'fe33da2c-f030-49ce-972c-3e5be54e626b', label: 'Psikoloji' },
];

function RegisterPage() {
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<RegisterForm>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'student',
      departmentId: '',
      studentNumber: '',
      employeeNumber: '',
      title: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const selectedRole = watch('role');
  const departmentValue = watch('departmentId');

  const onSubmit: SubmitHandler<RegisterForm> = async (values) => {
    setServerError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        role: values.role,
        departmentId: values.departmentId,
      };

      if (values.role === 'student') {
        payload.studentNumber = values.studentNumber;
      } else {
        payload.employeeNumber = values.employeeNumber;
        payload.title = values.title;
      }

      const response = await registerRequest(payload);
      const message =
        (response as { data?: { message?: string } })?.data?.message ||
        'Kayıt başarılı. Lütfen e-postanızı doğrulama için kontrol edin.';
      setSuccessMessage(message);

      // Redirect to login after a short pause so the user can see the message
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setServerError(getErrorMessage(error, 'Kayıt başarısız.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Yeni hesap oluştur"
      subtitle="Öğrenci veya akademisyen olarak kayıt olun"
      maxWidth="64rem"
      action={
        <Link to="/login" className="text-sm text-blue-600 hover:underline">
          Zaten hesabınız var mı?
        </Link>
      }
    >
      <Stack spacing={1.5} sx={{ mb: 2 }}>
        {serverError && <Alert variant="error" message={serverError} />}
        {successMessage && <Alert variant="success" message={successMessage} />}
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextInput
              label="İsim"
              name="firstName"
              placeholder="Adınızı girin"
              register={register}
              error={errors.firstName?.message}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextInput
              label="Soyisim"
              name="lastName"
              placeholder="Soyadınızı girin"
              register={register}
              error={errors.lastName?.message}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextInput
              label="E-posta"
              type="email"
              name="email"
              placeholder="ornek@universite.edu.tr"
              register={register}
              error={errors.email?.message}
            />
          </Grid>
        </Grid>

        {/* SECOND ROW: Rol / Bölüm / Şifre / Şifre Tekrar */}
        <Grid container spacing={3} alignItems="flex-start" sx={{ mt: 3 }}>
          <Grid item xs={12} md={3}>
            <FormControl
              fullWidth
              size="medium"
              margin="normal"
              error={!!errors.role}
            >
              <InputLabel id="role-label">Rol</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                label="Rol"
                value={watch('role') || ''}
                onChange={(e) =>
                  setValue('role', e.target.value as RegisterForm['role'], { shouldValidate: true })
                }
              >
                <MenuItem value="">
                  <em>Seçiniz</em>
                </MenuItem>
                <MenuItem value="student">Öğrenci</MenuItem>
                <MenuItem value="faculty">Akademisyen</MenuItem>
              </Select>
              <FormHelperText>{errors.role?.message}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl
              fullWidth
              size="medium"
              margin="normal"
              error={!!errors.departmentId}
            >
              <InputLabel id="department-label">Bölüm</InputLabel>
              <Select
                labelId="department-label"
                id="department"
                label="Bölüm"
                value={departmentValue || ''}
                onChange={(e) =>
                  setValue('departmentId', e.target.value as string, { shouldValidate: true })
                }
              >
                <MenuItem value="">
                  <em>Seçiniz</em>
                </MenuItem>
                {departmentOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{errors.departmentId?.message}</FormHelperText>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <PasswordInput
              label="Şifre"
              name="password"
              placeholder="********"
              register={register}
              error={errors.password?.message}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <PasswordInput
              label="Şifre Tekrar"
              name="confirmPassword"
              placeholder="********"
              register={register}
              error={errors.confirmPassword?.message}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <TextInput
              label={selectedRole === 'student' ? 'Öğrenci Numarası' : 'Personel Numarası'}
              name={selectedRole === 'student' ? 'studentNumber' : 'employeeNumber'}
              placeholder={selectedRole === 'student' ? 'Öğrenci numaranız' : 'Personel numaranız'}
              register={register}
              error={
                selectedRole === 'student'
                  ? errors.studentNumber?.message
                  : errors.employeeNumber?.message
              }
            />
          </Grid>
          {selectedRole === 'faculty' && (
            <Grid item xs={12} md={4}>
              <TextInput
                label="Unvan"
                name="title"
                placeholder="Dr. Öğr. Üyesi"
                register={register}
                error={errors.title?.message}
              />
            </Grid>
          )}
        </Grid>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={1}
          sx={{ mt: 2 }}
        >
          <CheckboxInput
            label="Kullanım şartlarını kabul ediyorum"
            name="acceptTerms"
            register={register}
            error={errors.acceptTerms?.message}
          />
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <LoadingSpinner label="Kayıt oluyor..." /> : 'Hesap Oluştur'}
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;
