import { Box, Pagination } from '@mui/material';
import { Notification } from '../../types/notifications';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
    notifications: Notification[];
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onMarkAsRead: (id: string) => void;
    onDelete: (id: string) => void;
}

const NotificationList = ({
    notifications,
    page,
    totalPages,
    onPageChange,
    onMarkAsRead,
    onDelete,
}: NotificationListProps) => {
    return (
        <Box>
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
                />
            ))}

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => onPageChange(value)}
                        color="primary"
                    />
                </Box>
            )}
        </Box>
    );
};

export default NotificationList;
