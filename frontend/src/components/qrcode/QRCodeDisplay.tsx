import { useState } from 'react';
import {
    Box,
    Dialog,
    DialogContent,
    IconButton,
    Typography,
    Tooltip,
    Paper,
} from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
    value: string;
    size?: number;
    title?: string;
    showCopyButton?: boolean;
    showFullscreenButton?: boolean;
}

function QRCodeDisplay({
    value,
    size = 120,
    title,
    showCopyButton = true,
    showFullscreenButton = true,
}: QRCodeDisplayProps) {
    const [fullscreen, setFullscreen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    if (!value) {
        return (
            <Typography color="text.secondary" variant="body2">
                QR kod yok
            </Typography>
        );
    }

    return (
        <>
            <Paper
                elevation={0}
                sx={{
                    p: 1,
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                }}
            >
                <Box
                    sx={{
                        p: 1,
                        bgcolor: 'white',
                        borderRadius: 1,
                        cursor: showFullscreenButton ? 'pointer' : 'default',
                    }}
                    onClick={() => showFullscreenButton && setFullscreen(true)}
                >
                    <QRCodeSVG value={value} size={size} level="M" />
                </Box>

                <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
                    {showFullscreenButton && (
                        <Tooltip title="Tam ekran">
                            <IconButton size="small" onClick={() => setFullscreen(true)}>
                                <FullscreenIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    {showCopyButton && (
                        <Tooltip title={copied ? 'Kopyalandı!' : 'Kodu kopyala'}>
                            <IconButton size="small" onClick={handleCopy}>
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Paper>

            {/* Fullscreen Modal */}
            <Dialog
                open={fullscreen}
                onClose={() => setFullscreen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        py: 4,
                    }}
                >
                    <IconButton
                        onClick={() => setFullscreen(false)}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {title && (
                        <Typography variant="h6" gutterBottom>
                            {title}
                        </Typography>
                    )}

                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                        <QRCodeSVG value={value} size={280} level="H" />
                    </Box>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 2, fontFamily: 'monospace' }}
                    >
                        {value}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Bu QR kodu yemekhane/etkinlik girişinde gösterin
                    </Typography>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default QRCodeDisplay;
