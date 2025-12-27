import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface EmptyStateProps {
    title?: string;
    message?: string;
    icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title = 'Veri Bulunamadı',
    message = 'Görüntülenecek veri bulunmamaktadır.',
    icon,
}) => {
    return (
        <Paper
            sx={{
                p: 6,
                textAlign: 'center',
                bgcolor: 'background.default',
            }}
        >
            <Box sx={{ mb: 2 }}>
                {icon || <InboxIcon sx={{ fontSize: 64, color: 'text.secondary' }} />}
            </Box>
            <Typography variant="h6" gutterBottom color="text.primary">
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {message}
            </Typography>
        </Paper>
    );
};

export default EmptyState;
