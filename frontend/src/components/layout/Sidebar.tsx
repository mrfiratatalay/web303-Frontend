import { NavLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
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
      { to: '/dashboard', label: 'Dashboard', icon: <SpaceDashboardOutlinedIcon fontSize="small" /> },
      { to: '/profile', label: 'Profil', icon: <PersonOutlineIcon fontSize="small" /> },
    ],
  },
  {
    title: 'Akademik',
    items: [
      { to: '/courses', label: 'Dersler', icon: <MenuBookOutlinedIcon fontSize="small" /> },
      { to: '/sections', label: 'Sectionlar', icon: <LayersOutlinedIcon fontSize="small" /> },
      { to: '/enrollments/my', label: 'Kayitlarim', roles: ['student'], icon: <SchoolOutlinedIcon fontSize="small" /> },
      { to: '/enrollments/schedule', label: 'Programim', roles: ['student'], icon: <ScheduleOutlinedIcon fontSize="small" /> },
      {
        to: '/faculty/sections/students',
        label: 'Section Ogrencileri',
        roles: ['faculty', 'admin'],
        icon: <GroupOutlinedIcon fontSize="small" />,
      },
    ],
  },
  {
    title: 'Notlar',
    items: [
      { to: '/grades/my', label: 'Notlarim', roles: ['student'], icon: <AssignmentTurnedInOutlinedIcon fontSize="small" /> },
      { to: '/grades/transcript', label: 'Transkript', roles: ['student'], icon: <ReceiptLongOutlinedIcon fontSize="small" /> },
      { to: '/faculty/grades/entry', label: 'Not Girisi', roles: ['faculty', 'admin'], icon: <BorderColorOutlinedIcon fontSize="small" /> },
      { to: '/faculty/grades/bulk', label: 'Toplu Not', roles: ['faculty', 'admin'], icon: <PlaylistAddCheckOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    title: 'Yoklama',
    items: [
      { to: '/attendance/checkin', label: 'Yoklama Ver', roles: ['student'], icon: <HowToRegOutlinedIcon fontSize="small" /> },
      { to: '/attendance/my', label: 'Yoklama Ozet', roles: ['student'], icon: <FactCheckOutlinedIcon fontSize="small" /> },
      { to: '/attendance/excuse', label: 'Mazeret Gonder', roles: ['student'], icon: <MarkChatReadOutlinedIcon fontSize="small" /> },
      { to: '/attendance/sessions', label: 'Oturumlar', roles: ['faculty', 'admin'], icon: <EventNoteOutlinedIcon fontSize="small" /> },
      { to: '/attendance/report', label: 'Yoklama Raporu', roles: ['faculty', 'admin'], icon: <AssessmentOutlinedIcon fontSize="small" /> },
      { to: '/attendance/excuse/review', label: 'Mazeret Incele', roles: ['faculty', 'admin'], icon: <RuleFolderOutlinedIcon fontSize="small" /> },
    ],
  },
  {
    title: 'Yonetim',
    items: [
      { to: '/admin/courses/new', label: 'Ders Yonetimi', roles: ['admin'], icon: <LibraryAddCheckOutlinedIcon fontSize="small" /> },
      { to: '/admin/sections/new', label: 'Section Yonetimi', roles: ['admin'], icon: <ViewAgendaOutlinedIcon fontSize="small" /> },
      { to: '/admin/users', label: 'Kullanicilar', roles: ['admin'], icon: <SupervisorAccountOutlinedIcon fontSize="small" /> },
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
        width: 208,
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
              sx={{ px: 1, letterSpacing: 0.6, display: 'block' }}
            >
              {section.title}
            </Typography>
            <List disablePadding>
              {visibleItems.map((item) => (
                <ListItemButton
                  key={item.to}
                  component={NavLink}
                  to={item.to}
                  sx={{
                    mb: 0.5,
                    borderRadius: 2,
                    px: 1.25,
                    py: 0.75,
                    '&.active': {
                      bgcolor: 'primary.light',
                      color: 'primary.dark',
                      fontWeight: 700,
                      position: 'relative',
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
                    '& .MuiListItemIcon-root': { minWidth: 32, color: 'text.secondary' },
                    '&.active .MuiListItemIcon-root': { color: 'primary.main' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>{item.icon}</ListItemIcon>
                  <ListItemText primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} primary={item.label} />
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
