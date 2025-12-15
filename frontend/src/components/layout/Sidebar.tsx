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
import { AppRole, strings } from '../../strings';

type NavItem = {
  to: string;
  label: string;
  roles?: AppRole[];
  icon: JSX.Element;
};

const iconMap: Record<string, JSX.Element> = {
  '/dashboard': <SpaceDashboardOutlinedIcon fontSize="small" />,
  '/profile': <PersonOutlineIcon fontSize="small" />,
  '/courses': <MenuBookOutlinedIcon fontSize="small" />,
  '/sections': <LayersOutlinedIcon fontSize="small" />,
  '/enrollments/my': <SchoolOutlinedIcon fontSize="small" />,
  '/enrollments/schedule': <ScheduleOutlinedIcon fontSize="small" />,
  '/faculty/sections/students': <GroupOutlinedIcon fontSize="small" />,
  '/grades/my': <AssignmentTurnedInOutlinedIcon fontSize="small" />,
  '/grades/transcript': <ReceiptLongOutlinedIcon fontSize="small" />,
  '/faculty/grades/entry': <BorderColorOutlinedIcon fontSize="small" />,
  '/faculty/grades/bulk': <PlaylistAddCheckOutlinedIcon fontSize="small" />,
  '/attendance/checkin': <HowToRegOutlinedIcon fontSize="small" />,
  '/attendance/my': <FactCheckOutlinedIcon fontSize="small" />,
  '/attendance/excuse': <MarkChatReadOutlinedIcon fontSize="small" />,
  '/attendance/sessions': <EventNoteOutlinedIcon fontSize="small" />,
  '/attendance/report': <AssessmentOutlinedIcon fontSize="small" />,
  '/attendance/excuse/review': <RuleFolderOutlinedIcon fontSize="small" />,
  '/admin/courses/new': <LibraryAddCheckOutlinedIcon fontSize="small" />,
  '/admin/sections/new': <ViewAgendaOutlinedIcon fontSize="small" />,
  '/admin/users': <SupervisorAccountOutlinedIcon fontSize="small" />,
};

export const navSections: Array<{ title: string; items: NavItem[] }> = strings.sidebar.sections.map((section) => ({
  title: section.title,
  items: section.items.map((item) => ({
    ...item,
    icon: iconMap[item.to] || <SpaceDashboardOutlinedIcon fontSize="small" />,
  })),
}));

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
