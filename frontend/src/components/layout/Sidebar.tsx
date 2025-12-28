import { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import BorderColorOutlinedIcon from '@mui/icons-material/BorderColorOutlined';
import PlaylistAddCheckOutlinedIcon from '@mui/icons-material/PlaylistAddCheckOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import MarkChatReadOutlinedIcon from '@mui/icons-material/MarkChatReadOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import RuleFolderOutlinedIcon from '@mui/icons-material/RuleFolderOutlined';
import LibraryAddCheckOutlinedIcon from '@mui/icons-material/LibraryAddCheckOutlined';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import QrCodeScannerOutlinedIcon from '@mui/icons-material/QrCodeScannerOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { useAuth } from '../../hooks/useAuth';
import { AppRole, strings } from '../../strings';

type NavItem = {
  to: string;
  label: string;
  roles?: AppRole[];
  icon: JSX.Element;
  end?: boolean; // For exact route matching
};

export const navSections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: strings.sidebar.sections.general,
    items: [
      { to: '/dashboard', label: strings.sidebar.items.dashboard, icon: <SpaceDashboardOutlinedIcon fontSize="small" /> },
      { to: '/profile', label: strings.sidebar.items.profile, icon: <PersonOutlineIcon fontSize="small" /> },
    ],
  },
  {
    title: strings.sidebar.sections.academic,
    items: [
      { to: '/courses', label: strings.sidebar.items.courses, icon: <MenuBookOutlinedIcon fontSize="small" /> },
      { to: '/sections', label: strings.sidebar.items.sections, icon: <LayersOutlinedIcon fontSize="small" /> },
      {
        to: '/enrollments/my',
        label: strings.sidebar.items.myEnrollments,
        roles: ['student'],
        icon: <SchoolOutlinedIcon fontSize="small" />,
      },
      {
        to: '/enrollments/schedule',
        label: strings.sidebar.items.mySchedule,
        roles: ['student'],
        icon: <ScheduleOutlinedIcon fontSize="small" />,
      },
      {
        to: '/faculty/sections/students',
        label: strings.sidebar.items.sectionStudents,
        roles: ['faculty', 'admin'],
        icon: <GroupOutlinedIcon fontSize="small" />,
      },
    ],
  },
  {
    title: strings.sidebar.sections.grades,
    items: [
      {
        to: '/grades/my',
        label: strings.sidebar.items.myGrades,
        roles: ['student'],
        icon: <AssignmentTurnedInOutlinedIcon fontSize="small" />,
      },
      {
        to: '/grades/transcript',
        label: strings.sidebar.items.transcript,
        roles: ['student'],
        icon: <ReceiptLongOutlinedIcon fontSize="small" />,
      },
      {
        to: '/faculty/grades/entry',
        label: strings.sidebar.items.gradeEntry,
        roles: ['faculty', 'admin'],
        icon: <BorderColorOutlinedIcon fontSize="small" />,
      },
      {
        to: '/faculty/grades/bulk',
        label: strings.sidebar.items.gradeBulk,
        roles: ['faculty', 'admin'],
        icon: <PlaylistAddCheckOutlinedIcon fontSize="small" />,
      },
    ],
  },
  {
    title: strings.sidebar.sections.attendance,
    items: [
      {
        to: '/attendance/checkin',
        label: strings.sidebar.items.attendanceCheckIn,
        roles: ['student'],
        icon: <HowToRegOutlinedIcon fontSize="small" />,
      },
      {
        to: '/attendance/my',
        label: strings.sidebar.items.attendanceSummary,
        roles: ['student'],
        icon: <FactCheckOutlinedIcon fontSize="small" />,
      },
      {
        to: '/attendance/excuse',
        label: strings.sidebar.items.attendanceExcuse,
        roles: ['student'],
        icon: <MarkChatReadOutlinedIcon fontSize="small" />,
        end: true, // Prevent conflict with /attendance/excuse/review
      },
      {
        to: '/attendance/sessions',
        label: strings.sidebar.items.attendanceSessions,
        roles: ['faculty', 'admin'],
        icon: <EventNoteOutlinedIcon fontSize="small" />,
      },
      {
        to: '/attendance/report',
        label: strings.sidebar.items.attendanceReport,
        roles: ['faculty', 'admin'],
        icon: <AssessmentOutlinedIcon fontSize="small" />,
      },
      {
        to: '/attendance/excuse/review',
        label: strings.sidebar.items.attendanceReview,
        roles: ['faculty', 'admin'],
        icon: <RuleFolderOutlinedIcon fontSize="small" />,
      },
    ],
  },
  {
    title: strings.sidebar.sections.campus,
    items: [
      { to: '/meals/cafeterias', label: strings.sidebar.items.cafeterias, icon: <RestaurantOutlinedIcon fontSize="small" /> },
      { to: '/meals/menus', label: strings.sidebar.items.meals, icon: <RestaurantOutlinedIcon fontSize="small" /> },
      {
        to: '/meals/reservations',
        label: strings.sidebar.items.mealReservations,
        roles: ['student'],
        icon: <RestaurantOutlinedIcon fontSize="small" />,
      },
      {
        to: '/meals/qr-use',
        label: strings.sidebar.items.mealQrUse,
        roles: ['faculty', 'admin'],
        icon: <QrCodeScannerOutlinedIcon fontSize="small" />,
      },
      {
        to: '/wallet',
        label: strings.sidebar.items.wallet,
        roles: ['student', 'faculty'],
        icon: <AccountBalanceWalletOutlinedIcon fontSize="small" />
      },
      { to: '/events', label: strings.sidebar.items.events, icon: <EventAvailableOutlinedIcon fontSize="small" />, end: true },
      { to: '/events/my-registrations', label: strings.sidebar.items.eventRegistrations, icon: <EventNoteOutlinedIcon fontSize="small" /> },
      {
        to: '/events/checkin',
        label: strings.sidebar.items.eventCheckIn,
        roles: ['faculty', 'admin'],
        icon: <QrCodeScannerOutlinedIcon fontSize="small" />,
      },
      {
        to: '/scheduling/my',
        label: strings.sidebar.items.scheduling,
        icon: <CalendarMonthOutlinedIcon fontSize="small" />,
      },
      {
        to: '/scheduling/generate',
        label: strings.sidebar.items.schedulingGenerate,
        roles: ['admin'],
        icon: <CalendarMonthOutlinedIcon fontSize="small" />,
      },
      {
        to: '/reservations/new',
        label: strings.sidebar.items.reservationCreate,
        roles: ['student'],
        icon: <MeetingRoomOutlinedIcon fontSize="small" />,
      },
      {
        to: '/reservations/my',
        label: strings.sidebar.items.reservationMine,
        roles: ['student'],
        icon: <MeetingRoomOutlinedIcon fontSize="small" />,
      },
      {
        to: '/admin/reservations',
        label: strings.sidebar.items.reservationRequests,
        roles: ['admin'],
        icon: <AssignmentOutlinedIcon fontSize="small" />,
      },
    ],
  },
  {
    title: strings.sidebar.sections.admin,
    items: [
      {
        to: '/admin/courses/new',
        label: strings.sidebar.items.courseAdmin,
        roles: ['admin'],
        icon: <LibraryAddCheckOutlinedIcon fontSize="small" />,
      },
      {
        to: '/admin/sections/new',
        label: strings.sidebar.items.sectionAdmin,
        roles: ['admin'],
        icon: <ViewAgendaOutlinedIcon fontSize="small" />,
      },
      {
        to: '/admin/users',
        label: strings.sidebar.items.users,
        roles: ['admin'],
        icon: <SupervisorAccountOutlinedIcon fontSize="small" />,
      },
      {
        to: '/admin/menus',
        label: 'Menü Yönetimi',
        roles: ['admin'],
        icon: <RestaurantOutlinedIcon fontSize="small" />,
      },
      {
        to: '/admin/events',
        label: 'Etkinlik Yönetimi',
        roles: ['admin'],
        icon: <EventAvailableOutlinedIcon fontSize="small" />,
      },
    ],
  },
  {
    title: 'Analitik',
    items: [
      {
        to: '/analytics/dashboard',
        label: 'Analytics Dashboard',
        roles: ['admin'],
        icon: <AssessmentOutlinedIcon fontSize="small" />,
      },
      {
        to: '/analytics/academic',
        label: 'Akademik Analiz',
        roles: ['admin', 'faculty'],
        icon: <AssessmentOutlinedIcon fontSize="small" />,
      },
      {
        to: '/analytics/attendance',
        label: 'Yoklama Analitiği',
        roles: ['admin', 'faculty'],
        icon: <AssessmentOutlinedIcon fontSize="small" />,
      },
      {
        to: '/analytics/meal',
        label: 'Yemek Raporları',
        roles: ['admin'],
        icon: <RestaurantOutlinedIcon fontSize="small" />,
      },
      {
        to: '/analytics/event',
        label: 'Etkinlik Analitiği',
        roles: ['admin'],
        icon: <EventAvailableOutlinedIcon fontSize="small" />,
      },
    ],
  },
  {
    title: 'Bildirimler',
    items: [
      {
        to: '/notifications',
        label: 'Bildirimler',
        icon: <EventNoteOutlinedIcon fontSize="small" />,
        end: true, // Exact match to prevent both being active
      },
      {
        to: '/notifications/preferences',
        label: 'Bildirim Tercihleri',
        icon: <RuleFolderOutlinedIcon fontSize="small" />,
      },
    ],
  },
];

function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;
  const location = useLocation();

  // Aktif rotaya göre hangi bölümün açık olması gerektiğini bul
  const getActiveSectionIndex = useMemo(() => {
    return navSections.findIndex((section) =>
      section.items.some((item) => location.pathname.startsWith(item.to))
    );
  }, [location.pathname]);

  // Her bölüm için açık/kapalı state'i
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({});

  // Sayfa yüklendiğinde veya rota değiştiğinde aktif bölümü aç
  useEffect(() => {
    if (getActiveSectionIndex !== -1) {
      setOpenSections((prev) => ({
        ...prev,
        [getActiveSectionIndex]: true,
      }));
    }
  }, [getActiveSectionIndex]);

  const toggleSection = (index: number) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <Box
      component="aside"
      className="hidden md:block"
      sx={{
        width: { md: 220, lg: 236 },
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        px: 1.5,
        py: 2,
        boxShadow: 'inset -1px 0 0 rgba(15,23,42,0.04)',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 64px)',
        '&::-webkit-scrollbar': {
          width: 6,
        },
        '&::-webkit-scrollbar-track': {
          bgcolor: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: 'divider',
          borderRadius: 3,
        },
      }}
    >
      {navSections.map((section, sectionIndex) => {
        const visibleItems = section.items.filter((item) => !item.roles || (role && item.roles.includes(role)));
        if (!visibleItems.length) return null;

        const isOpen = openSections[sectionIndex] ?? false;
        const hasActiveItem = visibleItems.some((item) => location.pathname.startsWith(item.to));

        return (
          <Box key={section.title} sx={{ mb: 0.5 }}>
            {/* Tıklanabilir Bölüm Başlığı */}
            <Box
              onClick={() => toggleSection(sectionIndex)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1,
                py: 0.75,
                cursor: 'pointer',
                borderRadius: 1.5,
                transition: 'background-color 0.2s ease',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Typography
                variant="overline"
                fontWeight={700}
                color={hasActiveItem ? 'primary.main' : 'text.secondary'}
                sx={{ 
                  letterSpacing: 0.6, 
                  display: 'block',
                  fontSize: '0.7rem',
                  userSelect: 'none',
                }}
              >
                {section.title}
              </Typography>
              <Box
                sx={{
                  color: hasActiveItem ? 'primary.main' : 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'transform 0.2s ease',
                }}
              >
                {isOpen ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
              </Box>
            </Box>

            {/* Collapse ile Açılır-Kapanır İçerik */}
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, pl: 0.5 }}>
                {visibleItems.map((item) => (
                  <ListItemButton
                    key={item.to}
                    component={NavLink}
                    to={item.to}
                    end={item.end}
                    aria-label={item.label}
                    sx={{
                      position: 'relative',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.75,
                      gap: 1,
                      minHeight: 40,
                      transition: 'background-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                      '&:focus-visible': {
                        outline: '2px solid',
                        outlineColor: 'primary.main',
                        boxShadow: '0 0 0 3px rgba(59,130,246,0.25)',
                      },
                      '&.active': {
                        bgcolor: 'primary.light',
                        color: 'primary.dark',
                        fontWeight: 700,
                        boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.16)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 4,
                          top: 6,
                          bottom: 6,
                          width: 3,
                          bgcolor: 'primary.main',
                          borderRadius: 8,
                        },
                      },
                      '& .MuiListItemIcon-root': {
                        minWidth: 28,
                        color: 'text.secondary',
                        justifyContent: 'center',
                      },
                      '&.active .MuiListItemIcon-root': { color: 'primary.main' },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 28 }}>{item.icon}</ListItemIcon>
                    <Tooltip title={item.label} enterDelay={500} placement="right">
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: 500,
                          noWrap: true,
                          sx: { lineHeight: 1.4, letterSpacing: 0.1, fontSize: '0.825rem' },
                        }}
                        sx={{
                          my: 0,
                          '.MuiListItemText-primary': {
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          },
                        }}
                      />
                    </Tooltip>
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
            <Divider sx={{ mt: 0.75, mb: 0.5 }} />
          </Box>
        );
      })}
    </Box>
  );
}

export default Sidebar;
