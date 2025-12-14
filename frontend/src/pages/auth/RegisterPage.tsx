import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
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
import apiClient from '../../services/apiClient';
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

type DepartmentOption = { id: string; name: string; code?: string; faculty?: string };

function RegisterPage() {
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [departmentsError, setDepartmentsError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
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

  useEffect(() => {
    const fetchDepartments = async () => {
      setDepartmentsError('');
      try {
        const response = await apiClient.get<{ data?: DepartmentOption[] } | DepartmentOption[]>(
          '/departments',
        );
        const list =
          (response.data as { data?: DepartmentOption[] })?.data ||
          (response.data as DepartmentOption[]);
        if (Array.isArray(list) && list.length > 0) {
          setDepartments(list);
        } else {
          setDepartments([]);
          setDepartmentsError('Bölümler yüklenemedi. Lütfen daha sonra tekrar deneyin.');
        }
      } catch (error) {
        setDepartments([]);
        setDepartmentsError(
          getErrorMessage(error, 'Bölümler yüklenemedi. Lütfen sayfayı yenileyin.'),
        );
      }
    };

    fetchDepartments();
  }, []);

  const onSubmit: SubmitHandler<RegisterForm> = async (values) => {
    setServerError('');
    setSuccessMessage('');
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
        (response as { data?: { data?: { message?: string } } })?.data?.data?.message ||
        'Kayıt başarılı. Lütfen e-postanızı doğrulama için kontrol edin.';
      setSuccessMessage(message);

      // Redirect to login after a short pause so the user can see the message
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      const message = getErrorMessage(error, 'Kayıt başarısız.');
      setServerError(message);
      if (message.toLowerCase().includes('bölüm')) {
        // Refresh departments in case the list changed
        try {
          const response = await apiClient.get<{ data?: DepartmentOption[] } | DepartmentOption[]>(
            '/departments',
          );
          const list =
            (response.data as { data?: DepartmentOption[] })?.data ||
            (response.data as DepartmentOption[]);
          if (Array.isArray(list)) {
            setDepartments(list);
          }
        } catch (err) {
          setDepartmentsError(
            getErrorMessage(err, 'Bölümler güncellenemedi. Lütfen tekrar deneyin.'),
          );
        }
      }
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
              error={!!errors.departmentId || !!departmentsError}
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
                disabled={departments.length === 0}
              >
                <MenuItem value="">
                  <em>Seçiniz</em>
                </MenuItem>
                {departments.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {errors.departmentId?.message || departmentsError}
              </FormHelperText>
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
          <Button type="submit" variant="contained" disabled={isSubmitting || departments.length === 0}>
            {isSubmitting ? <LoadingSpinner label="Kayıt oluyor..." /> : 'Hesap Oluştur'}
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;
