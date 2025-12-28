import { yupResolver } from '@hookform/resolvers/yup';
import BadgeIcon from '@mui/icons-material/Badge';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EmailIcon from '@mui/icons-material/Email';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LockIcon from '@mui/icons-material/Lock';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkIcon from '@mui/icons-material/Work';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
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

const API_BASE_ORIGIN = (() => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiBaseUrl) {
    return '';
  }
  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return '';
  }
})();

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Stat Card Component
const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      p: 2,
      borderRadius: 2,
      bgcolor: `${color}.50`,
      border: '1px solid',
      borderColor: `${color}.200`,
      minWidth: 100,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: 2,
      },
    }}
  >
    <Box sx={{ color: `${color}.main`, mb: 0.5 }}>{icon}</Box>
    <Typography variant="h6" fontWeight={700} color={`${color}.dark`}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

// Info Row Component
const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 1.5 }}>
    <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
    <Box flex={1}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  </Stack>
);

function ProfilePage() {
  const { user, loadCurrentUser, setUser } = useAuth();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

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
      setMessage('Profil başarıyla güncellendi.');
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
      setError('Sadece JPG veya PNG yükleyebilirsiniz.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setError('Dosya boyutu 5MB üzerinde olamaz.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      await uploadProfilePicture(file);
      const refreshed = await loadCurrentUser();
      setUser(refreshed);
      setMessage('Profil fotoğrafı güncellendi.');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUploadingAvatar(false);
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
      setMessage('Şifre başarıyla güncellendi.');
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
    return 'Sistem Yönetimi';
  }, [user]);

  const roleLabel = useMemo(() => {
    switch (user?.role) {
      case 'student':
        return 'Öğrenci';
      case 'faculty':
        return 'Akademisyen';
      case 'admin':
        return 'Yönetici';
      default:
        return user?.role || '';
    }
  }, [user]);

  const avatarSrc =
    user?.profile_picture_url &&
    (user.profile_picture_url.startsWith('http')
      ? user.profile_picture_url
      : `${API_BASE_ORIGIN}${user.profile_picture_url}`);

  if (!user) {
    return (
      <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner label="Profil yükleniyor..." />
      </Box>
    );
  }

  const fullName = `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim();

  return (
    <Stack spacing={3}>
      {/* Hero Banner */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: 4,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
          minHeight: 200,
        }}
      >
        {/* Pattern Overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          alignItems="center"
          sx={{ position: 'relative', p: 4, pt: 5 }}
        >
          {/* Avatar with Camera Overlay */}
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={avatarSrc}
              alt={fullName}
              sx={{
                width: 120,
                height: 120,
                border: '4px solid white',
                boxShadow: 3,
                bgcolor: 'primary.dark',
                fontSize: '2.5rem',
                fontWeight: 700,
              }}
            >
              {(user.first_name || user.firstName || 'U')[0]}
            </Avatar>
            {/* Camera Overlay */}
            <Tooltip title="Fotoğraf Değiştir">
              <IconButton
                component="label"
                disabled={isUploadingAvatar}
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'white',
                  boxShadow: 2,
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                {isUploadingAvatar ? (
                  <LoadingSpinner />
                ) : (
                  <CameraAltIcon fontSize="small" />
                )}
                <input type="file" hidden accept="image/jpeg,image/png" onChange={handleAvatarChange} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* User Info */}
          <Box flex={1} textAlign={{ xs: 'center', md: 'left' }}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', md: 'flex-start' }} mb={0.5}>
              <Typography variant="h4" fontWeight={800} color="white">
                {fullName}
              </Typography>
              <Chip
                label={roleLabel}
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(4px)',
                }}
              />
            </Stack>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
              {user.email}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {displayDepartment}
            </Typography>
          </Box>

          {/* Stats */}
          <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
            {user.role === 'student' && (
              <>
                <StatCard
                  icon={<TrendingUpIcon />}
                  label="GPA"
                  value={user.student?.gpa ? Number(user.student.gpa).toFixed(2) : '-'}
                  color="success"
                />
                <StatCard
                  icon={<MenuBookIcon />}
                  label="Ders"
                  value={user.student?.enrolled_courses || '-'}
                  color="info"
                />
                <StatCard
                  icon={<EventAvailableIcon />}
                  label="Devam"
                  value={user.student?.attendance_rate ? `${user.student.attendance_rate}%` : '-'}
                  color="warning"
                />
              </>
            )}
            {user.role === 'faculty' && (
              <>
                <StatCard
                  icon={<MenuBookIcon />}
                  label="Ders"
                  value={user.faculty?.course_count || '-'}
                  color="info"
                />
                <StatCard
                  icon={<SchoolIcon />}
                  label="Öğrenci"
                  value={user.faculty?.student_count || '-'}
                  color="success"
                />
              </>
            )}
            {user.role === 'admin' && (
              <StatCard
                icon={<WorkIcon />}
                label="Yetki"
                value="Tam"
                color="error"
              />
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Alerts */}
      {message && <Alert variant="success" message={message} />}
      {error && <Alert variant="error" message={error} />}

      {/* Tabs */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            '& .MuiTab-root': { py: 2 },
          }}
        >
          <Tab icon={<PersonIcon />} iconPosition="start" label="Bilgilerim" />
          <Tab icon={<LockIcon />} iconPosition="start" label="Güvenlik" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {/* Tab 0: Profile Info */}
          {activeTab === 0 && (
            <Stack spacing={4}>
              {/* Left: Info Display */}
              <Box>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Hesap Bilgileri
                </Typography>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    p: 2,
                    bgcolor: 'grey.50',
                  }}
                >
                  <InfoRow icon={<EmailIcon />} label="E-posta" value={user.email} />
                  <Divider />
                  <InfoRow
                    icon={<PhoneIcon />}
                    label="Telefon"
                    value={user.phone || 'Belirtilmemiş'}
                  />
                  <Divider />
                  <InfoRow icon={<SchoolIcon />} label="Bölüm" value={displayDepartment} />
                  {user.role === 'student' && user.student?.student_number && (
                    <>
                      <Divider />
                      <InfoRow
                        icon={<BadgeIcon />}
                        label="Öğrenci No"
                        value={user.student.student_number}
                      />
                    </>
                  )}
                  {user.role === 'faculty' && user.faculty?.employee_number && (
                    <>
                      <Divider />
                      <InfoRow
                        icon={<BadgeIcon />}
                        label="Personel No"
                        value={`${user.faculty.employee_number}${user.faculty.title ? ` • ${user.faculty.title}` : ''}`}
                      />
                    </>
                  )}
                </Card>
              </Box>

              {/* Right: Edit Form */}
              <Box>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Bilgileri Düzenle
                </Typography>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="İsim"
                        {...register('firstName')}
                        error={Boolean(errors.firstName?.message)}
                        helperText={errors.firstName?.message}
                        InputProps={{
                          startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Soyisim"
                        {...register('lastName')}
                        error={Boolean(errors.lastName?.message)}
                        helperText={errors.lastName?.message}
                        InputProps={{
                          startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Telefon"
                        placeholder="+90 5XX XXX XX XX"
                        {...register('phone')}
                        error={Boolean(errors.phone?.message)}
                        helperText={errors.phone?.message}
                        InputProps={{
                          startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isSavingProfile}
                        sx={{ px: 4 }}
                      >
                        {isSavingProfile ? <LoadingSpinner label="Kaydediliyor..." /> : '💾 Değişiklikleri Kaydet'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Stack>
          )}

          {/* Tab 1: Security */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Şifre Değiştir
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Güvenliğiniz için güçlü bir şifre kullanmanızı öneririz.
              </Typography>
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
                      InputProps={{
                        startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
                      }}
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
                      InputProps={{
                        startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
                      }}
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
                      InputProps={{
                        startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="warning"
                      size="large"
                      disabled={isSavingPassword}
                      sx={{ px: 4 }}
                    >
                      {isSavingPassword ? <LoadingSpinner label="Güncelleniyor..." /> : '🔐 Şifreyi Güncelle'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* Security Tips */}
              <Box
                sx={{
                  mt: 4,
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'info.50',
                  border: '1px solid',
                  borderColor: 'info.200',
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} color="info.dark" gutterBottom>
                  🛡️ Güvenlik İpuçları
                </Typography>
                <Typography variant="body2" color="info.dark">
                  • En az 8 karakter uzunluğunda şifre kullanın
                  <br />
                  • Büyük/küçük harf, rakam ve özel karakter içersin
                  <br />
                  • Kişisel bilgilerinizi şifrenizde kullanmayın
                  <br />
                  • Şifrenizi kimseyle paylaşmayın
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}

export default ProfilePage;
