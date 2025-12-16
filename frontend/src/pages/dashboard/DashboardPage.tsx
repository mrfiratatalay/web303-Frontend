import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ChecklistIcon from '@mui/icons-material/Checklist';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { alpha } from '@mui/material/styles';
import { ElementType, ReactNode, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import { strings } from '../../strings';

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
                {trend === 'up' ? strings.dashboard.trend.up : strings.dashboard.trend.down}
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
  <Paper elevation={0} sx={{ ...cardBaseSx, p: 2.5, minHeight, height: '100%' }}>
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

const formatTime = (time?: string | null) => (time ? time.slice(0, 5) : strings.common.format.timeFallback);
const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString('tr-TR') : strings.common.format.dateTimeFallback;

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
        const message = (err as Error)?.message || strings.dashboard.error;
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

  const userDisplayName = useMemo(() => {
    const fullName = `${user?.first_name || user?.firstName || ''} ${user?.last_name || user?.lastName || ''}`.trim();
    return fullName || strings.common.userFallback;
  }, [user?.firstName, user?.first_name, user?.lastName, user?.last_name]);

  const headerCopy = useMemo(
    () => ({
      title: `${strings.dashboard.header.greeting}, ${userDisplayName}`,
      subtitle:
        dashboard?.role === 'student'
          ? strings.dashboard.header.subtitles.student
          : dashboard?.role === 'faculty'
          ? strings.dashboard.header.subtitles.faculty
          : dashboard?.role === 'admin'
          ? strings.dashboard.header.subtitles.admin
          : strings.dashboard.header.subtitles.fallback,
    }),
    [dashboard?.role, userDisplayName],
  );

  const quickActions = useMemo(() => {
    if (dashboard?.role === 'student') {
      return strings.dashboard.quickActions.student;
    }
    if (dashboard?.role === 'faculty') {
      return strings.dashboard.quickActions.faculty;
    }
    if (dashboard?.role === 'admin') {
      return strings.dashboard.quickActions.admin;
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

    const getStatusLabel = (status?: string | null, fallback?: string | null) => {
      if (status === 'in_progress') return strings.dashboard.labels.inProgress;
      if (status === 'upcoming') return strings.dashboard.labels.upcoming;
      if (status) return status;
      if (fallback) return fallback;
      return strings.dashboard.labels.planned;
    };

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
                    {item.courseCode} - {strings.dashboard.labels.section} {item.sectionNumber}
                  </Typography>
                  <Chip
                    size="small"
                    label={getStatusLabel(item.status, item.day)}
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
                    {item.day ? `${item.day} - ` : ''}
                    {formatTime(item.startTime)} - {formatTime(item.endTime)}
                    {item.classroom ? ` - ${item.classroom}` : ''}
                    {item.nextDate ? ` - ${formatDateTime(item.nextDate)}` : ''}
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
          title={strings.dashboard.student.sections.recentGrades.emptyTitle}
          description={strings.dashboard.student.sections.recentGrades.emptyDescription}
          actionLabel={strings.dashboard.student.sections.recentGrades.emptyAction}
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
                      {grade.courseCode} - {grade.courseName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {strings.dashboard.labels.section} {grade.sectionNumber} - {strings.dashboard.labels.updatedAt}: {formatDateTime(grade.updatedAt)}
                    </Typography>
                  </Box>
                  <Chip
                    label={grade.letter || strings.dashboard.labels.awaiting}
                    color={grade.letter ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Stack>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  {strings.dashboard.labels.midterm}: {grade.midterm ?? '-'} - {strings.dashboard.labels.final}: {grade.final ?? '-'} - {strings.dashboard.labels.gradePoint}: {grade.gradePoint ?? '-'}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderStudent = (data: StudentDashboard) => {
    const gpaTrend: StatCardProps['trend'] = data.summary.gpa >= data.summary.cgpa ? 'up' : 'down';

    return (
      <Stack spacing={2.25}>
        <Grid container spacing={2.25} alignItems="stretch">
          <Grid item xs={12} md={3}>
            <StatCard
              label={strings.dashboard.student.stats.courses.label}
              value={data.summary.registeredCourses}
              helper={strings.dashboard.student.stats.courses.helper}
              icon={<SchoolRoundedIcon fontSize="small" />}
              tone="primary"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              label={strings.dashboard.student.stats.gpa.label}
              value={data.summary.gpa.toFixed(2)}
              helper={`${strings.dashboard.student.stats.gpa.helperPrefix}: ${data.summary.cgpa.toFixed(2)}`}
              icon={<ShowChartRoundedIcon fontSize="small" />}
              tone="info"
              trend={gpaTrend}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              label={strings.dashboard.student.stats.attendance.label}
              value={`${data.summary.attendanceRate}%`}
              helper={strings.dashboard.student.stats.attendance.helper}
              icon={<FactCheckRoundedIcon fontSize="small" />}
              tone="success"
              progress={data.summary.attendanceRate}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              label={strings.dashboard.student.stats.today.label}
              value={data.summary.todayCourseCount}
              helper={strings.dashboard.student.stats.today.helper}
              icon={<CalendarMonthRoundedIcon fontSize="small" />}
              tone="warning"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2.25} alignItems="stretch">
          <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
            <SectionCard
              title={strings.dashboard.student.sections.todayClasses.title}
              action={
                <Button component={RouterLink} to="/enrollments/schedule" size="small" variant="text">
                  {strings.dashboard.student.sections.todayClasses.action}
                </Button>
              }
            >
              {renderClasses(
                data.todayClasses,
                strings.dashboard.student.sections.todayClasses.emptyTitle,
                strings.dashboard.student.sections.todayClasses.emptyDescription,
                '/enrollments/schedule',
                strings.dashboard.student.sections.todayClasses.emptyAction,
              )}
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
            <SectionCard
              title={strings.dashboard.student.sections.recentGrades.title}
              action={
                <Button component={RouterLink} to="/grades/my" size="small" variant="text">
                  {strings.dashboard.student.sections.recentGrades.action}
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
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <StatCard
            label={strings.dashboard.faculty.stats.sections.label}
            value={data.summary.sectionCount}
            helper={strings.dashboard.faculty.stats.sections.helper}
            icon={<SchoolRoundedIcon fontSize="small" />}
            tone="primary"
          />
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <StatCard
            label={strings.dashboard.faculty.stats.students.label}
            value={data.summary.studentCount}
            helper={strings.dashboard.faculty.stats.students.helper}
            icon={<ChecklistIcon fontSize="small" />}
            tone="info"
          />
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <StatCard
            label={strings.dashboard.faculty.stats.pending.label}
            value={data.summary.pendingGrades + data.summary.pendingExcuses}
            helper={strings.dashboard.faculty.stats.pending.helperTemplate
              .replace('{grades}', String(data.summary.pendingGrades))
              .replace('{excuses}', String(data.summary.pendingExcuses))}
            icon={<TrendingUpRoundedIcon fontSize="small" />}
            tone="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.25} alignItems="stretch">
        <Grid item xs={12} md={7} sx={{ display: 'flex' }}>
          <SectionCard
            title={strings.dashboard.faculty.sections.upcoming.title}
            action={
              <Button component={RouterLink} to="/attendance/sessions" size="small" variant="text">
                {strings.dashboard.faculty.sections.upcoming.action}
              </Button>
            }
          >
            {renderClasses(
              data.upcomingSessions,
              strings.dashboard.faculty.sections.upcoming.emptyTitle,
              strings.dashboard.faculty.sections.upcoming.emptyDescription,
              '/attendance/sessions',
              strings.dashboard.faculty.sections.upcoming.emptyAction,
            )}
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
          <SectionCard title={strings.dashboard.faculty.sections.pending.title} minHeight={320}>
            {data.pendingActions.length === 0 ? (
              <EmptyState
                icon={TrendingUpRoundedIcon}
                title={strings.dashboard.faculty.sections.pending.emptyTitle}
                description={strings.dashboard.faculty.sections.pending.emptyDescription}
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
                          {action.helper || strings.dashboard.faculty.sections.pending.helperFallback}
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
        <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
          <StatCard
            label={strings.dashboard.admin.stats.students.label}
            value={data.summary.totalStudents}
            icon={<SchoolRoundedIcon fontSize="small" />}
            tone="primary"
            helper={strings.dashboard.admin.stats.students.helper}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
          <StatCard
            label={strings.dashboard.admin.stats.faculty.label}
            value={data.summary.facultyCount}
            icon={<ChecklistIcon fontSize="small" />}
            tone="info"
            helper={strings.dashboard.admin.stats.faculty.helper}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
          <StatCard
            label={strings.dashboard.admin.stats.courses.label}
            value={data.summary.activeCourses}
            icon={<CalendarMonthRoundedIcon fontSize="small" />}
            tone="warning"
            helper={strings.dashboard.admin.stats.courses.helper}
          />
        </Grid>
        <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
          <StatCard
            label={strings.dashboard.admin.stats.sections.label}
            value={data.summary.activeSections}
            icon={<TrendingUpRoundedIcon fontSize="small" />}
            tone="success"
            helper={strings.dashboard.admin.stats.sections.helper}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.25} alignItems="stretch">
        <Grid item xs={12} md={5} sx={{ display: 'flex' }}>
          <SectionCard title={strings.dashboard.admin.sections.systemStatus.title} minHeight={320}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TrendingUpIcon color="success" />
                <Typography variant="body1" fontWeight={700}>
                  {strings.dashboard.admin.sections.systemStatus.apiLabel}: {data.systemStatus.api}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <EventAvailableIcon color="info" />
                <Typography variant="body1" fontWeight={700}>
                  {strings.dashboard.admin.sections.systemStatus.dbLabel}: {data.systemStatus.database}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {strings.dashboard.admin.sections.systemStatus.lastCheck}: {formatDateTime(data.systemStatus.checkedAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {strings.dashboard.admin.sections.systemStatus.uptime}: {data.systemStatus.uptimeSeconds ?? 0}{' '}
                {strings.dashboard.admin.sections.systemStatus.uptimeUnit}
              </Typography>
            </Stack>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={7} sx={{ display: 'flex' }}>
          <SectionCard title={strings.dashboard.admin.sections.activities.title} minHeight={320}>
            {data.recentActivities.length === 0 ? (
              <EmptyState
                icon={TrendingUpRoundedIcon}
                title={strings.dashboard.admin.sections.activities.emptyTitle}
                description={strings.dashboard.admin.sections.activities.emptyDescription}
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
                          {activity.detail || strings.dashboard.admin.sections.activities.fallbackDetail} - {formatDateTime(activity.timestamp)}
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
              label={strings.roles[user?.role || ''] || strings.common.userFallback}
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
