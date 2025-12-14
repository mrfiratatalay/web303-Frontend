import { ElementType, ReactNode, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ChecklistIcon from '@mui/icons-material/Checklist';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useAuth } from '../../hooks/useAuth';
import { extractDashboard, getDashboard } from '../../services/dashboardApi';
import {
  AdminDashboard,
  DashboardActivity,
  DashboardClass,
  DashboardData,
  DashboardGrade,
  FacultyDashboard,
  StudentDashboard,
} from '../../types/dashboard';

type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  tone?: 'primary' | 'success' | 'warning' | 'info';
  icon?: ReactNode;
  progress?: number;
  trend?: 'up' | 'down';
};

type SectionCardProps = {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  minHeight?: number;
};

type EmptyStateProps = {
  icon: ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
};

const toneColors: Record<NonNullable<StatCardProps['tone']>, string> = {
  primary: '#3356d7',
  success: '#16a34a',
  warning: '#f59e0b',
  info: '#0ea5e9',
};

const cardBaseSx = {
  borderRadius: 3,
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 16px 40px rgba(15,23,42,0.05)',
  backgroundColor: 'background.paper',
};

const StatCard = ({ label, value, helper, tone = 'primary', icon, progress, trend }: StatCardProps) => {
  const toneColor = toneColors[tone];

  return (
    <Paper
      elevation={0}
      sx={{
        ...cardBaseSx,
        p: 2,
        pr: 2.25,
        borderLeft: `4px solid ${toneColor}`,
        height: '100%',
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {icon && (
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1.25,
                display: 'grid',
                placeItems: 'center',
                bgcolor: alpha(toneColor, 0.12),
                color: toneColor,
              }}
            >
              {icon}
            </Box>
          )}
          <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing={0.4}>
            {label}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.75} alignItems="baseline">
          <Typography variant="h5" fontWeight={800} color="text.primary">
            {value}
          </Typography>
          {trend && (
            <Stack
              direction="row"
              spacing={0.25}
              alignItems="center"
              sx={{ color: trend === 'up' ? 'success.main' : 'error.main' }}
            >
              {trend === 'up' ? <ArrowDropUpIcon fontSize="small" /> : <ArrowDropDownIcon fontSize="small" />}
              <Typography variant="caption" fontWeight={700}>
                {trend === 'up' ? 'Artış' : 'Düşüş'}
              </Typography>
            </Stack>
          )}
        </Stack>

        {helper && (
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.45 }}>
            {helper}
          </Typography>
        )}

        {typeof progress === 'number' && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              mt: 0.5,
              height: 6,
              borderRadius: 999,
              bgcolor: alpha(toneColor, 0.14),
              '& .MuiLinearProgress-bar': { bgcolor: toneColor },
            }}
          />
        )}
      </Stack>
    </Paper>
  );
};

const SectionCard = ({ title, children, action, minHeight = 320 }: SectionCardProps) => (
  <Paper elevation={0} sx={{ ...cardBaseSx, p: 2.5, minHeight }}>
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      {action}
    </Stack>
    {children}
  </Paper>
);

const EmptyState = ({ icon: Icon, title, description, actionLabel, actionTo }: EmptyStateProps) => (
  <Stack alignItems="center" spacing={1.5} sx={{ textAlign: 'center', py: 3.5 }}>
    <Box
      sx={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        bgcolor: 'grey.100',
        color: 'primary.main',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Icon />
    </Box>
    <Typography variant="subtitle1" fontWeight={700}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
    {actionTo && actionLabel && (
      <Button component={RouterLink} to={actionTo} variant="outlined" size="small">
        {actionLabel}
      </Button>
    )}
  </Stack>
);

const formatTime = (time?: string | null) => (time ? time.slice(0, 5) : '--:--');
const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString('tr-TR', { hour12: false }) : '-';

const roleLabel: Record<string, string> = {
  student: 'Öğrenci',
  faculty: 'Akademisyen',
  admin: 'Yönetici',
};

const getInitial = (text?: string | null) => (text ? text.charAt(0).toUpperCase() : '?');

function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await getDashboard();
        const data = extractDashboard(response);
        if (isMounted) {
          setDashboard(data);
        }
      } catch (err) {
        const message =
          (err as Error)?.message || 'Dashboard verileri alinirken bir hata olustu.';
        if (isMounted) {
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const headerCopy = useMemo(
    () => ({
      title: `Hoş geldin, ${user?.first_name || user?.firstName || 'kullanici'}`,
      subtitle:
        dashboard?.role === 'student'
          ? 'Kayıtlı derslerin, notların ve yoklama özetin burada.'
          : dashboard?.role === 'faculty'
          ? 'Sectionlar, yoklama ve not işlemleri için hızlı özet.'
          : 'Kampüsteki metrikler, sistem durumu ve son hareketler.',
    }),
    [dashboard?.role, user?.firstName, user?.first_name],
  );

  const quickActions = useMemo(() => {
    if (dashboard?.role === 'student') {
      return [
        { label: 'Programımı Gör', to: '/enrollments/schedule' },
        { label: 'Yoklama Ver', to: '/attendance/checkin' },
      ];
    }
    if (dashboard?.role === 'faculty') {
      return [
        { label: 'Oturumlar', to: '/attendance/sessions' },
        { label: 'Not Girişi', to: '/faculty/grades/entry' },
      ];
    }
    if (dashboard?.role === 'admin') {
      return [
        { label: 'Kullanıcılar', to: '/admin/users' },
        { label: 'Ders Yönetimi', to: '/admin/courses/new' },
      ];
    }
    return [];
  }, [dashboard?.role]);

  const isStudent = (data: DashboardData | null): data is StudentDashboard =>
    data?.role === 'student';
  const isFaculty = (data: DashboardData | null): data is FacultyDashboard =>
    data?.role === 'faculty';
  const isAdmin = (data: DashboardData | null): data is AdminDashboard =>
    data?.role === 'admin';

  const renderClasses = (
    items: DashboardClass[],
    emptyTitle: string,
    emptyDescription: string,
    emptyActionTo?: string,
    emptyActionLabel?: string,
  ) => {
    if (items.length === 0) {
      return (
        <EmptyState
          icon={EventBusyRoundedIcon}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          actionTo={emptyActionTo}
        />
      );
    }

    return (
      <List sx={{ width: '100%' }}>
        {items.map((item, idx) => (
          <ListItem
            key={`${item.courseCode}-${item.sectionNumber}-${idx}`}
            alignItems="flex-start"
            disablePadding
            sx={{
              p: 1.25,
              mb: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ListItemAvatar sx={{ minWidth: 48 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14 }}>
                {getInitial(item.courseCode)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" fontWeight={700}>
                    {item.courseCode} · Section {item.sectionNumber}
                  </Typography>
                  <Chip
                    size="small"
                    label={item.status || item.day || 'Planlı'}
                    color={
                      item.status === 'in_progress'
                        ? 'success'
                        : item.status === 'upcoming'
                        ? 'info'
                        : 'default'
                    }
                    variant="outlined"
                  />
                </Stack>
              }
              secondary={
                <Box>
                  <Typography variant="body2" color="text.primary" fontWeight={600}>
                    {item.courseName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.day ? `${item.day} · ` : ''}
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                    {item.classroom ? ` · ${item.classroom}` : ''}
                    {item.nextDate ? ` · ${formatDateTime(item.nextDate)}` : ''}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderGrades = (grades: DashboardGrade[]) => {
    if (grades.length === 0) {
      return (
        <EmptyState
          icon={TrendingUpRoundedIcon}
          title="Henüz not bulunmuyor"
          description="Notlar güncellendiğinde burada görebilirsin."
          actionLabel="Notları Aç"
          actionTo="/grades/my"
        />
      );
    }

    return (
      <List>
        {grades.map((grade, idx) => (
          <ListItem
            key={`${grade.courseCode}-${grade.sectionNumber}-${idx}`}
            disablePadding
            sx={{
              p: 1.25,
              mb: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ListItemText
              primary={
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {grade.courseCode} · {grade.courseName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Section {grade.sectionNumber} · Güncelleme: {formatDateTime(grade.updatedAt)}
                    </Typography>
                  </Box>
                  <Chip
                    label={grade.letter || 'Bekliyor'}
                    color={grade.letter ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Stack>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  Vize: {grade.midterm ?? '-'} · Final: {grade.final ?? '-'} · Not Ort: {grade.gradePoint ?? '-'}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderStudent = (data: StudentDashboard) => {
    const gpaTrend = data.summary.gpa >= data.summary.cgpa ? 'up' : 'down';

    return (
      <Stack spacing={2.25}>
        <Grid container spacing={2.25} alignItems="stretch">
          <Grid item xs={12} md={3}>
            <StatCard
              label="Kayıtlı Ders"
              value={data.summary.registeredCourses}
              helper="Aktif ve tamamlanan kayıtlar"
              icon={<SchoolRoundedIcon fontSize="small" />}
              tone="primary"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              label="GPA"
              value={data.summary.gpa.toFixed(2)}
              helper={`CGPA: ${data.summary.cgpa.toFixed(2)}`}
              icon={<ShowChartRoundedIcon fontSize="small" />}
              tone="info"
              trend={gpaTrend}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              label="Devam Oranı"
              value={`${data.summary.attendanceRate}%`}
              helper="Genel ortalama"
              icon={<FactCheckRoundedIcon fontSize="small" />}
              tone="success"
              progress={data.summary.attendanceRate}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              label="Bugünkü Ders"
              value={data.summary.todayCourseCount}
              helper="Günün programı"
              icon={<CalendarMonthRoundedIcon fontSize="small" />}
              tone="warning"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2.25}>
          <Grid item xs={12} md={6}>
            <SectionCard
              title="Bugünkü dersler"
              action={
                <Button component={RouterLink} to="/enrollments/schedule" size="small" variant="text">
                  Programı Aç
                </Button>
              }
            >
              {renderClasses(
                data.todayClasses,
                'Bugün ders yok',
                'Takvimine yeni ders eklenince burada görebilirsin.',
                '/enrollments/schedule',
                'Programımı Gör',
              )}
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard
              title="Son notlar"
              action={
                <Button component={RouterLink} to="/grades/my" size="small" variant="text">
                  Tüm notlar
                </Button>
              }
            >
              {renderGrades(data.recentGrades)}
            </SectionCard>
          </Grid>
        </Grid>
      </Stack>
    );
  };

  const renderFaculty = (data: FacultyDashboard) => (
    <Stack spacing={2.25}>
      <Grid container spacing={2.25} alignItems="stretch">
        <Grid item xs={12} md={4}>
          <StatCard
            label="Verdiğin Section"
            value={data.summary.sectionCount}
            helper="Aktif ve planlı"
            icon={<SchoolRoundedIcon fontSize="small" />}
            tone="primary"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            label="Toplam Öğrenci"
            value={data.summary.studentCount}
            helper="Section bazlı toplam"
            icon={<ChecklistIcon fontSize="small" />}
            tone="info"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            label="Bekleyen İşlem"
            value={data.summary.pendingGrades + data.summary.pendingExcuses}
            helper={`Not: ${data.summary.pendingGrades} · Mazeret: ${data.summary.pendingExcuses}`}
            icon={<TrendingUpRoundedIcon fontSize="small" />}
            tone="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.25}>
        <Grid item xs={12} md={7}>
          <SectionCard
            title="Yaklaşan oturumlar"
            action={
              <Button component={RouterLink} to="/attendance/sessions" size="small" variant="text">
                Oturumları Aç
              </Button>
            }
          >
            {renderClasses(
              data.upcomingSessions,
              'Oturum bulunmuyor',
              'Yaklaşan oturum eklenince listede göreceksin.',
              '/attendance/sessions',
              'Oturum Planla',
            )}
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={5}>
          <SectionCard title="Bekleyen işlemler" minHeight={320}>
            {data.pendingActions.length === 0 ? (
              <EmptyState
                icon={TrendingUpRoundedIcon}
                title="Bekleyen işlem yok"
                description="Tamamlanacak öğe bulunmuyor."
              />
            ) : (
              <List>
                {data.pendingActions.map((action, idx) => (
                  <ListItem
                    key={`${action.label}-${idx}`}
                    disablePadding
                    sx={{
                      p: 1.25,
                      mb: 1,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 48 }}>
                      <Avatar sx={{ bgcolor: 'grey.100', color: 'text.primary', width: 36, height: 36 }}>
                        <ChecklistIcon fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle2" fontWeight={700}>
                            {action.label}
                          </Typography>
                          <Chip label={action.value} size="small" color="primary" variant="outlined" />
                        </Stack>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {action.helper || 'Tamamlanmayı bekliyor'}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  );

  const renderAdmin = (data: AdminDashboard) => (
    <Stack spacing={2.25}>
      <Grid container spacing={2.25} alignItems="stretch">
        <Grid item xs={12} md={3}>
          <StatCard
            label="Öğrenci Sayısı"
            value={data.summary.totalStudents}
            icon={<SchoolRoundedIcon fontSize="small" />}
            tone="primary"
            helper="Aktif öğrenciler"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Akademisyen"
            value={data.summary.facultyCount}
            icon={<ChecklistIcon fontSize="small" />}
            tone="info"
            helper="Sistemdeki toplam"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Aktif Ders"
            value={data.summary.activeCourses}
            icon={<CalendarMonthRoundedIcon fontSize="small" />}
            tone="warning"
            helper="Bu dönem"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Aktif Section"
            value={data.summary.activeSections}
            icon={<TrendingUpRoundedIcon fontSize="small" />}
            tone="success"
            helper="Açık section sayısı"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.25}>
        <Grid item xs={12} md={5}>
          <SectionCard title="Sistem durumu" minHeight={320}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TrendingUpIcon color="success" />
                <Typography variant="body1" fontWeight={700}>
                  API: {data.systemStatus.api}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <EventAvailableIcon color="info" />
                <Typography variant="body1" fontWeight={700}>
                  Database: {data.systemStatus.database}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Son kontrol: {formatDateTime(data.systemStatus.checkedAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Uptime: {data.systemStatus.uptimeSeconds ?? 0} sn
              </Typography>
            </Stack>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={7}>
          <SectionCard title="Son aktiviteler" minHeight={320}>
            {data.recentActivities.length === 0 ? (
              <EmptyState
                icon={TrendingUpRoundedIcon}
                title="Aktivite bulunmuyor"
                description="Yeni hareketler burada listelenecek."
              />
            ) : (
              <List>
                {data.recentActivities.map((activity: DashboardActivity, idx) => (
                  <ListItem
                    key={`${activity.type}-${activity.timestamp}-${idx}`}
                    disablePadding
                    sx={{
                      p: 1.25,
                      mb: 1,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 48 }}>
                      <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.dark', width: 36, height: 36 }}>
                        {getInitial(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight={700}>
                          {activity.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {activity.detail || 'Güncelleme'} · {formatDateTime(activity.timestamp)}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  );

  return (
    <Stack spacing={2.5}>
      <Paper
        elevation={0}
        sx={{
          ...cardBaseSx,
          p: { xs: 2, md: 2.5 },
          background: 'linear-gradient(120deg, rgba(51,86,215,0.08), rgba(14,165,233,0.05))',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            {getInitial(user?.first_name || user?.firstName)}
          </Avatar>
          <Box flex={1} width="100%">
            <Typography variant="h5" fontWeight={800} color="text.primary">
              {headerCopy.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {headerCopy.subtitle}
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
          >
            <Chip
              label={roleLabel[user?.role || ''] || 'Rol'}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontWeight: 700 }}
            />
            {quickActions.map((action) => (
              <Button
                key={action.to}
                component={RouterLink}
                to={action.to}
                size="small"
                variant="outlined"
                color="inherit"
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Paper>

      {loading && <LinearProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && dashboard && (
        <>
          {isStudent(dashboard) && renderStudent(dashboard)}
          {isFaculty(dashboard) && renderFaculty(dashboard)}
          {isAdmin(dashboard) && renderAdmin(dashboard)}
        </>
      )}
    </Stack>
  );
}

export default DashboardPage;
