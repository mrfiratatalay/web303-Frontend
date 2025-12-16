import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import Grid from '@mui/material/Grid';
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
import { strings } from '../../strings';

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
        const response = await apiClient.get<{ data?: DepartmentOption[] } | DepartmentOption[]>('/departments');
        const list =
          (response.data as { data?: DepartmentOption[] })?.data ||
          (response.data as DepartmentOption[]);
        if (Array.isArray(list) && list.length > 0) {
          setDepartments(list);
        } else {
          setDepartments([]);
          setDepartmentsError(strings.auth.register.departments.loadError);
        }
      } catch (error) {
        setDepartments([]);
        setDepartmentsError(getErrorMessage(error, strings.auth.register.departments.loadError));
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
        strings.auth.register.success;
      setSuccessMessage(message);

      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      const message = getErrorMessage(error, strings.auth.register.error);
      setServerError(message);
      if (message.toLowerCase().includes('bölüm')) {
        try {
          const response = await apiClient.get<{ data?: DepartmentOption[] } | DepartmentOption[]>('/departments');
          const list =
            (response.data as { data?: DepartmentOption[] })?.data ||
            (response.data as DepartmentOption[]);
          if (Array.isArray(list)) {
            setDepartments(list);
          }
        } catch (err) {
          setDepartmentsError(getErrorMessage(err, strings.auth.register.departments.reloadError));
        }
      }
    }
  };

  return (
    <AuthLayout
      title={strings.auth.register.title}
      subtitle={strings.auth.register.subtitle}
      maxWidth="64rem"
      action={
        <Link to="/login" className="text-sm text-blue-600 hover:underline">
          {strings.auth.register.cta}
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
              label={strings.auth.register.labels.firstName}
              name="firstName"
              placeholder={strings.auth.register.placeholders.firstName}
              register={register}
              error={errors.firstName?.message}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextInput
              label={strings.auth.register.labels.lastName}
              name="lastName"
              placeholder={strings.auth.register.placeholders.lastName}
              register={register}
              error={errors.lastName?.message}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextInput
              label={strings.auth.register.labels.email}
              type="email"
              name="email"
              placeholder={strings.auth.register.placeholders.email}
              register={register}
              error={errors.email?.message}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} alignItems="flex-start" sx={{ mt: 3 }}>
          <Grid item xs={12} md={3}>
            <FormControl
              fullWidth
              size="medium"
              margin="normal"
              error={!!errors.role}
            >
              <InputLabel id="role-label">{strings.auth.register.labels.role}</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                label={strings.auth.register.labels.role}
                value={watch('role') || ''}
                onChange={(e) =>
                  setValue('role', e.target.value as RegisterForm['role'], { shouldValidate: true })
                }
              >
                <MenuItem value="">
                  <em>{strings.auth.register.labels.select}</em>
                </MenuItem>
                <MenuItem value="student">{strings.roles.student}</MenuItem>
                <MenuItem value="faculty">{strings.roles.faculty}</MenuItem>
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
              <InputLabel id="department-label">{strings.auth.register.labels.department}</InputLabel>
              <Select
                labelId="department-label"
                id="department"
                label={strings.auth.register.labels.department}
                value={departmentValue || ''}
                onChange={(e) =>
                  setValue('departmentId', e.target.value as string, { shouldValidate: true })
                }
                disabled={departments.length === 0}
              >
                <MenuItem value="">
                  <em>{strings.auth.register.labels.select}</em>
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
              label={strings.auth.register.labels.password}
              name="password"
              placeholder={strings.auth.register.placeholders.password}
              register={register}
              error={errors.password?.message}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <PasswordInput
              label={strings.auth.register.labels.confirmPassword}
              name="confirmPassword"
              placeholder={strings.auth.register.placeholders.confirmPassword}
              register={register}
              error={errors.confirmPassword?.message}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <TextInput
              label={selectedRole === 'student' ? strings.auth.register.labels.studentNumber : strings.auth.register.labels.employeeNumber}
              name={selectedRole === 'student' ? 'studentNumber' : 'employeeNumber'}
              placeholder={selectedRole === 'student' ? strings.auth.register.placeholders.studentNumber : strings.auth.register.placeholders.employeeNumber}
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
                label={strings.auth.register.labels.title}
                name="title"
                placeholder={strings.auth.register.placeholders.title}
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
            label={strings.auth.register.labels.terms}
            name="acceptTerms"
            register={register}
            error={errors.acceptTerms?.message}
          />
          <Button type="submit" variant="contained" disabled={isSubmitting || departments.length === 0}>
            {isSubmitting ? <LoadingSpinner label={strings.auth.register.submitting} /> : strings.auth.register.submit}
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  );
}

export default RegisterPage;
