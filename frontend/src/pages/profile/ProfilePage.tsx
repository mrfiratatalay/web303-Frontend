import { yupResolver } from '@hookform/resolvers/yup';
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useEffect, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import {
    changePassword as changePasswordRequest,
    updateProfile,
    uploadProfilePicture,
} from '../../services/authApi';
import { User } from '../../types/auth';
import { getErrorMessage } from '../../utils/error';
import { changePasswordSchema, profileSchema } from '../../utils/validationSchemas';

type ProfileForm = {
  firstName: string;
  lastName: string;
  phone?: string | null;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

const unwrap = <T,>(response: { data?: { data?: T } | T } | T): T =>
  (response as { data?: { data?: T } })?.data?.data ??
  (response as { data?: T })?.data ??
  (response as T);

const API_BASE_ORIGIN =
  (() => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    if (!apiBaseUrl) {
      return '';
    }
    try {
      return new URL(apiBaseUrl).origin;
    } catch (err) {
      return '';
    }
  })();

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

function ProfilePage() {
  const { user, loadCurrentUser, setUser } = useAuth();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      firstName: user?.first_name || user?.firstName || '',
      lastName: user?.last_name || user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordForm>({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  useEffect(() => {
    reset({
      firstName: user?.first_name || user?.firstName || '',
      lastName: user?.last_name || user?.lastName || '',
      phone: user?.phone || '',
    });
  }, [reset, user]);

  const onSubmit: SubmitHandler<ProfileForm> = async (values) => {
    setIsSavingProfile(true);
    setError('');
    setMessage('');
    try {
      const response = await updateProfile(values);
      const updated = unwrap<User>(response);
      setUser(updated);
      setMessage('Profil güncellendi.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    setError('');
    setMessage('');
    const file = event.target.files[0];

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Sadece JPG veya PNG yükleyin.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setError('Dosya boyutu 5MB üzerinde olamaz.');
      return;
    }

    try {
      await uploadProfilePicture(file);
      const refreshed = await loadCurrentUser();
      setUser(refreshed);
      setMessage('Profil fotoğrafı güncellendi.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const onChangePassword: SubmitHandler<PasswordForm> = async (values) => {
    setIsSavingPassword(true);
    setError('');
    setMessage('');
    try {
      await changePasswordRequest({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmNewPassword,
      });
      setMessage('Şifre güncellendi. Tekrar giriş yapabilirsiniz.');
      resetPasswordForm();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSavingPassword(false);
    }
  };

  const displayDepartment = useMemo(() => {
    if (user?.role === 'student') {
      return user.student?.department?.name || 'Bölüm atanmadı';
    }
    if (user?.role === 'faculty') {
      return user.faculty?.department?.name || 'Bölüm atanmadı';
    }
    return 'Yönetici';
  }, [user]);

  const avatarSrc =
    user?.profile_picture_url &&
    (user.profile_picture_url.startsWith('http')
      ? user.profile_picture_url
      : `${API_BASE_ORIGIN}${user.profile_picture_url}`);

  if (!user) {
    return (
      <Box className="flex h-full items-center justify-center">
        <LoadingSpinner label="Profil yükleniyor..." />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Summary Card */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <Avatar
              src={avatarSrc}
              alt="Profil"
              sx={{ width: 72, height: 72, bgcolor: 'primary.light', fontWeight: 700 }}
            >
              {(user.first_name || user.firstName || 'P')[0]}
            </Avatar>
            <Box flex={1} width="100%">
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Typography variant="h6" fontWeight={800}>
                  {user.first_name || user.firstName} {user.last_name || user.lastName}
                </Typography>
                <Chip label={user.role.toUpperCase()} size="small" color="primary" />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {displayDepartment}
              </Typography>
              {user.role === 'student' && user.student?.student_number && (
                <Typography variant="body2" color="text.secondary">
                  Öğrenci No: {user.student.student_number}
                </Typography>
              )}
              {user.role === 'faculty' && user.faculty?.employee_number && (
                <Typography variant="body2" color="text.secondary">
                  Personel No: {user.faculty.employee_number} {user.faculty?.title ? `• ${user.faculty.title}` : ''}
                </Typography>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Profile Edit */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(14,165,233,0.04))',
        }}
      >
        <CardHeader title="Profil Bilgileri" subheader="Bilgilerinizi güncelleyebilirsiniz" />
        <CardContent>
          {message && (
            <Box mb={2}>
              <Alert variant="success" message={message} />
            </Box>
          )}
          {error && (
            <Box mb={2}>
              <Alert variant="error" message={error} />
            </Box>
          )}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="İsim"
                  {...register('firstName')}
                  error={Boolean(errors.firstName?.message)}
                  helperText={errors.firstName?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Soyisim"
                  {...register('lastName')}
                  error={Boolean(errors.lastName?.message)}
                  helperText={errors.lastName?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  {...register('phone')}
                  error={Boolean(errors.phone?.message)}
                  helperText={errors.phone?.message}
                />
              </Grid>
            </Grid>
            <Button type="submit" variant="contained" disabled={isSavingProfile} sx={{ mt: 3 }}>
              {isSavingProfile ? <LoadingSpinner label="Kaydediliyor..." /> : 'Değişiklikleri Kaydet'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Profile Photo */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardHeader title="Profil Fotoğrafı" />
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={avatarSrc}
              alt="Profil"
              sx={{ width: 64, height: 64, bgcolor: 'primary.light', fontWeight: 700 }}
            >
              {(user.first_name || user.firstName || 'P')[0]}
            </Avatar>
            <Button variant="outlined" component="label">
              Fotoğraf Yükle
              <input type="file" hidden accept="image/jpeg,image/png" onChange={handleAvatarChange} />
            </Button>
            <Typography variant="caption" color="text.secondary">
              Sadece JPG veya PNG, max 5MB.
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardHeader title="Şifre Değiştir" />
        <CardContent>
          <Box component="form" onSubmit={handlePasswordSubmit(onChangePassword)}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  type="password"
                  label="Mevcut Şifre"
                  fullWidth
                  {...registerPassword('currentPassword')}
                  error={Boolean(passwordErrors.currentPassword?.message)}
                  helperText={passwordErrors.currentPassword?.message}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  type="password"
                  label="Yeni Şifre"
                  fullWidth
                  {...registerPassword('newPassword')}
                  error={Boolean(passwordErrors.newPassword?.message)}
                  helperText={passwordErrors.newPassword?.message}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  type="password"
                  label="Yeni Şifre Tekrar"
                  fullWidth
                  {...registerPassword('confirmNewPassword')}
                  error={Boolean(passwordErrors.confirmNewPassword?.message)}
                  helperText={passwordErrors.confirmNewPassword?.message}
                />
              </Grid>
            </Grid>
            <Button type="submit" variant="contained" disabled={isSavingPassword} sx={{ mt: 3 }}>
              {isSavingPassword ? <LoadingSpinner label="Güncelleniyor..." /> : 'Şifreyi Güncelle'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default ProfilePage;

