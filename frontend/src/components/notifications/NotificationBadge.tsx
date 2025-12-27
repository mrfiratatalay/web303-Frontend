import { useEffect, useState } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, Box, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import { getUnreadCount, markAsRead, extractData } from '../../services/notificationApi';

const NotificationBadge = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();

    const fetchUnreadCount = async () => {
        try {
            const response = await getUnreadCount();
            const data = extractData(response);
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    useEffect(() => {
        fetchUnreadCount();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleViewAll = () => {
        handleClose();
        navigate('/notifications');
    };

    const handleViewPreferences = () => {
        handleClose();
        navigate('/notifications/preferences');
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: { width: 320, maxWidth: '100%' }
                }}
            >
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="h6">Bildirimler</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {unreadCount} okunmamış bildirim
                    </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleViewAll}>
                    <Typography>Tüm Bildirimleri Görüntüle</Typography>
                </MenuItem>
                <MenuItem onClick={handleViewPreferences}>
                    <Typography>Bildirim Ayarları</Typography>
                </MenuItem>
            </Menu>
        </>
    );
};

export default NotificationBadge;
