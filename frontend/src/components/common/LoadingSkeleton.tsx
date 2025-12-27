import React from 'react';
import { Skeleton, Box, Card, CardContent, Grid } from '@mui/material';

interface LoadingSkeletonProps {
    variant?: 'table' | 'card' | 'chart' | 'list';
    count?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ variant = 'card', count = 3 }) => {
    if (variant === 'table') {
        return (
            <Box>
                <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
                {Array.from({ length: count }).map((_, index) => (
                    <Skeleton key={index} variant="rectangular" height={60} sx={{ mb: 1 }} />
                ))}
            </Box>
        );
    }

    if (variant === 'chart') {
        return (
            <Box>
                <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
                <Skeleton variant="rectangular" height={300} />
            </Box>
        );
    }

    if (variant === 'list') {
        return (
            <Box>
                {Array.from({ length: count }).map((_, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="60%" />
                            <Skeleton variant="text" width="40%" />
                        </Box>
                    </Box>
                ))}
            </Box>
        );
    }

    // Default: card variant
    return (
        <Grid container spacing={3}>
            {Array.from({ length: count }).map((_, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Skeleton variant="text" width="60%" height={30} />
                            <Skeleton variant="text" width="40%" height={40} sx={{ mt: 1 }} />
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default LoadingSkeleton;
