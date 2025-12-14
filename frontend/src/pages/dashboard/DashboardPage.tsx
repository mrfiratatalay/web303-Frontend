import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Chip,
  Divider,
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
import ChecklistIcon from '@mui/icons-material/Checklist';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
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
  accent?: string;
};

const StatCard = ({ label, value, helper, accent }: StatCardProps) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.25,
      borderRadius: 3,
      background: accent || 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      border: '1px solid',
      borderColor: 'divider',
      minHeight: 120,
    }}
  >
    <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing={0.5}>
      {label}
    </Typography>
    <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ mt: 0.5 }}>
      {value}
    </Typography>
    {helper && (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {helper}
      </Typography>
    )}
  </Paper>
);

const formatTime = (time?: string | null) => (time ? time.slice(0, 5) : '--:--');
const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString('tr-TR', { hour12: false }) : '-';

const roleLabel: Record<string, string> = {
  student: 'Ogrenci',
  faculty: 'Akademisyen',
  admin: 'Yonetici',
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
      title: `Hos geldin, ${user?.first_name || user?.firstName || 'kullanici'}`,
      subtitle:
        dashboard?.role === 'student'
          ? 'Kayitli derslerin, notlarin ve yoklama ozetin burada.'
          : dashboard?.role === 'faculty'
          ? 'Sectionlar, yoklama ve not islemleri icin hizli ozet.'
          : 'Kampusteki temel metrikler, sistem durumu ve son hareketler.',
    }),
    [dashboard?.role, user?.firstName, user?.first_name],
  );

  const isStudent = (data: DashboardData | null): data is StudentDashboard =>
    data?.role === 'student';
  const isFaculty = (data: DashboardData | null): data is FacultyDashboard =>
    data?.role === 'faculty';
  const isAdmin = (data: DashboardData | null): data is AdminDashboard =>
    data?.role === 'admin';

  const renderClasses = (items: DashboardClass[], emptyText: string) => (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        minHeight: 260,
      }}
    >
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {emptyText}
        </Typography>
      ) : (
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
                      label={item.status || item.day || 'planli'}
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
      )}
    </Paper>
  );

  const renderGrades = (grades: DashboardGrade[]) => (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        minHeight: 260,
      }}
    >
      {grades.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Henuz not bulunmuyor.
        </Typography>
      ) : (
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
                        Section {grade.sectionNumber} · Guncelleme: {formatDateTime(grade.updatedAt)}
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
      )}
    </Paper>
  );

  const renderStudent = (data: StudentDashboard) => (
    <Stack spacing={2.5}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Kayitli Ders"
            value={data.summary.registeredCourses}
            helper="Aktif ve tamamlanan kayitlar"
            accent="linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            label="GPA"
            value={data.summary.gpa.toFixed(2)}
            helper={`CGPA: ${data.summary.cgpa.toFixed(2)}`}
            accent="linear-gradient(135deg, #fef9c3 0%, #fef08a 100%)"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Devam Orani"
            value={`${data.summary.attendanceRate}%`}
            helper="Genel ortalama"
            accent="linear-gradient(135deg, #ecfccb 0%, #d9f99d 100%)"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Bugunku Ders"
            value={data.summary.todayCourseCount}
            helper="Gunun programi"
            accent="linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            Bugunku dersler
          </Typography>
          {renderClasses(data.todayClasses, 'Bugun icin ders bulunmuyor.')}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            Son notlar
          </Typography>
          {renderGrades(data.recentGrades)}
        </Grid>
      </Grid>
    </Stack>
  );

  const renderFaculty = (data: FacultyDashboard) => (
    <Stack spacing={2.5}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <StatCard
            label="Verdigin Section"
            value={data.summary.sectionCount}
            helper="Aktif ve planli"
            accent="linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            label="Toplam Ogrenci"
            value={data.summary.studentCount}
            helper="Section bazli toplam"
            accent="linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            label="Bekleyen Islemler"
            value={data.summary.pendingGrades + data.summary.pendingExcuses}
            helper={`Not: ${data.summary.pendingGrades} · Mazeret: ${data.summary.pendingExcuses}`}
            accent="linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            Yaklasan oturumlar
          </Typography>
          {renderClasses(data.upcomingSessions, 'Gelecek oturum bulunmuyor.')}
        </Grid>
        <Grid item xs={12} md={5}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            Bekleyen islemler
          </Typography>
          <Paper
            elevation={0}
            sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', minHeight: 260 }}
          >
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
                        {action.helper || 'Tamamlanmayi bekliyor'}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
              {data.pendingActions.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Bekleyen islem yok.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );

  const renderAdmin = (data: AdminDashboard) => (
    <Stack spacing={2.5}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Ogrenci Sayisi"
            value={data.summary.totalStudents}
            accent="linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 100%)"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Akademisyen"
            value={data.summary.facultyCount}
            accent="linear-gradient(135deg, #ecfccb 0%, #d9f99d 100%)"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Aktif Ders"
            value={data.summary.activeCourses}
            accent="linear-gradient(135deg, #fef9c3 0%, #fde68a 100%)"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            label="Aktif Section"
            value={data.summary.activeSections}
            accent="linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%)"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={5}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            Sistem durumu
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              minHeight: 260,
            }}
          >
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
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            Son aktiviteler
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              minHeight: 260,
            }}
          >
            {data.recentActivities.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Aktivite bulunmuyor.
              </Typography>
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
                          {activity.detail || 'Guncelleme'}
                          {' · '}
                          {formatDateTime(activity.timestamp)}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );

  return (
    <Stack spacing={3}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(14,165,233,0.06))',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            {getInitial(user?.first_name || user?.firstName)}
          </Avatar>
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
          <Box flex={1} width="100%">
            <Typography variant="h5" fontWeight={800} color="text.primary">
              {headerCopy.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {headerCopy.subtitle}
            </Typography>
          </Box>
          <Chip label={roleLabel[user?.role || ''] || 'Rol'} color="primary" variant="outlined" />
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
