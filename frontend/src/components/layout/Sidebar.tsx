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
import { useAuth } from '../../hooks/useAuth';

type NavItem = {
  to: string;
  label: string;
  roles?: Array<'student' | 'faculty' | 'admin'>;
  icon: JSX.Element;
};

const navSections: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Genel',
    items: [
      { to: '/dashboard', label: 'Panel', icon: <SpaceDashboardOutlinedIcon fontSize="small" /> },
      { to: '/profile', label: 'Profil', icon: <PersonOutlineIcon fontSize="small" /> },
    ],
  },
  {
    title: 'Akademik',
    items: [
      { to: '/courses', label: 'Dersler', icon: <MenuBookOutlinedIcon fontSize="small" /> },
      { to: '/sections', label: 'Şubeler', icon: <LayersOutlinedIcon fontSize="small" /> },
      { to: '/enrollments/my', label: 'Kayıtlarım', roles: ['student'], icon: <SchoolOutlinedIcon fontSize="small" /> },
      { to: '/enrollments/schedule', label: 'Programım', roles: ['student'], icon: <ScheduleOutlinedIcon fontSize="small" /> },
      {
        to: '/faculty/sections/students',
        label: 'Şube Öğrencileri',
        roles: ['faculty', 'admin'],
        icon: <GroupOutlinedIcon fontSize="small" />,
      },
    ],
  },
  {
    title: 'Notlar',
    items: [
      { to: '/grades/my', label: 'Notlarım', roles: ['student'], icon: <AssignmentTurnedInOutlinedIcon fontSize="small" /> },
      { to: '/grades/transcript', label: 'Transkript', roles: ['student'], icon: <ReceiptLongOutlinedIcon fontSize="small" /> },
      { to: '/faculty/grades/entry', label: 'Not Girişi', roles: ['faculty', 'admin'], icon: <BorderColorOutlinedIcon fontSize="small" /> },
      { to: '/faculty/grades/bulk', label: 'Toplu Not Girişi', roles: ['faculty', 'admin'], icon: <PlaylistAddCheckOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    title: 'Yoklama',
    items: [
      { to: '/attendance/checkin', label: 'Yoklama Ver', roles: ['student'], icon: <HowToRegOutlinedIcon fontSize="small" /> },
      { to: '/attendance/my', label: 'Yoklama Özeti', roles: ['student'], icon: <FactCheckOutlinedIcon fontSize="small" /> },
      { to: '/attendance/excuse', label: 'Mazeret Gönder', roles: ['student'], icon: <MarkChatReadOutlinedIcon fontSize="small" /> },
      { to: '/attendance/sessions', label: 'Oturumlar', roles: ['faculty', 'admin'], icon: <EventNoteOutlinedIcon fontSize="small" /> },
      { to: '/attendance/report', label: 'Yoklama Raporu', roles: ['faculty', 'admin'], icon: <AssessmentOutlinedIcon fontSize="small" /> },
      { to: '/attendance/excuse/review', label: 'Mazeret İncele', roles: ['faculty', 'admin'], icon: <RuleFolderOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    title: 'Yönetim',
    items: [
      { to: '/admin/courses/new', label: 'Ders Yönetimi', roles: ['admin'], icon: <LibraryAddCheckOutlinedIcon fontSize="small" /> },
      { to: '/admin/sections/new', label: 'Şube Yönetimi', roles: ['admin'], icon: <ViewAgendaOutlinedIcon fontSize="small" /> },
      { to: '/admin/users', label: 'Kullanıcılar', roles: ['admin'], icon: <SupervisorAccountOutlinedIcon fontSize="small" /> },
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
