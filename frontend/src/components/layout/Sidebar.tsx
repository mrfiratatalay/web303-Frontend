import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
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
      { to: '/wallet', label: strings.sidebar.items.wallet, icon: <AccountBalanceWalletOutlinedIcon fontSize="small" /> },
      { to: '/events', label: strings.sidebar.items.events, icon: <EventAvailableOutlinedIcon fontSize="small" /> },
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
];

function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

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
      }}
    >
      {navSections.map((section) => {
        const visibleItems = section.items.filter((item) => !item.roles || (role && item.roles.includes(role)));
        if (!visibleItems.length) return null;

        return (
          <Box key={section.title} sx={{ mb: 1.5 }}>
            <Typography
              variant="overline"
              fontWeight={700}
              color="text.secondary"
              sx={{ px: 1, letterSpacing: 0.6, display: 'block', mb: 0.5 }}
            >
              {section.title}
            </Typography>
            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              {visibleItems.map((item) => (
                <ListItemButton
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  aria-label={item.label}
                  sx={{
                    position: 'relative',
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.9,
                    gap: 1,
                    minHeight: 44,
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
                        left: 6,
                        top: 8,
                        bottom: 8,
                        width: 3,
                        bgcolor: 'primary.main',
                        borderRadius: 8,
                      },
                    },
                    '& .MuiListItemIcon-root': {
                      minWidth: 32,
                      color: 'text.secondary',
                      justifyContent: 'center',
                    },
                    '&.active .MuiListItemIcon-root': { color: 'primary.main' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                  <Tooltip title={item.label} enterDelay={500} placement="right">
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: 600,
                        noWrap: true,
                        sx: { lineHeight: 1.4, letterSpacing: 0.1 },
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
            <Divider sx={{ mt: 1, mb: 1.5 }} />
          </Box>
        );
      })}
    </Box>
  );
}

export default Sidebar;
