import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
    Box,
    Button,
    Paper,
    Typography,
    Stack,
    Alert,
    CircularProgress,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import StopIcon from '@mui/icons-material/Stop';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';

interface QRScannerProps {
    onScan: (code: string) => void;
    onError?: (error: string) => void;
    width?: number;
    height?: number;
    autoStart?: boolean;
}

function QRScanner({
    onScan,
    onError,
    width = 300,
    height = 300,
    autoStart = false,
}: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
    const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const scannerId = useRef(`qr-scanner-${Date.now()}`);

    useEffect(() => {
        // Get available cameras
        Html5Qrcode.getCameras()
            .then((devices) => {
                if (devices && devices.length) {
                    setCameras(devices.map((d) => ({ id: d.id, label: d.label })));
                    // Prefer back camera
                    const backCameraIndex = devices.findIndex(
                        (d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('arka')
                    );
                    if (backCameraIndex !== -1) {
                        setCurrentCameraIndex(backCameraIndex);
                    }
                }
            })
            .catch((err) => {
                console.error('Camera enumeration failed:', err);
            });

        return () => {
            stopScanning();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (autoStart && cameras.length > 0 && !isScanning) {
            startScanning();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoStart, cameras]);

    const startScanning = async () => {
        if (isScanning || isLoading) return;

        setIsLoading(true);
        setError('');

        try {
            // Clean up existing scanner
            if (scannerRef.current) {
                try {
                    await scannerRef.current.stop();
                } catch {
                    // Ignore
                }
                scannerRef.current = null;
            }

            const scanner = new Html5Qrcode(scannerId.current);
            scannerRef.current = scanner;

            const cameraId = cameras[currentCameraIndex]?.id || { facingMode: 'environment' };

            await scanner.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: { width: Math.min(width - 50, 250), height: Math.min(height - 50, 250) },
                    aspectRatio: 1,
                },
                (decodedText) => {
                    // Success callback
                    onScan(decodedText);
                    // Vibrate if supported
                    if (navigator.vibrate) {
                        navigator.vibrate(200);
                    }
                },
                () => {
                    // Error callback (ignore scan failures, only handle fatal errors)
                }
            );

            setIsScanning(true);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Kamera başlatılamadı';
            setError(message);
            onError?.(message);
        } finally {
            setIsLoading(false);
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
            } catch {
                // Ignore
            }
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    const switchCamera = async () => {
        if (cameras.length <= 1) return;

        const wasScanning = isScanning;
        await stopScanning();

        const nextIndex = (currentCameraIndex + 1) % cameras.length;
        setCurrentCameraIndex(nextIndex);

        if (wasScanning) {
            // Wait a bit for cleanup
            setTimeout(() => {
                startScanning();
            }, 300);
        }
    };

    return (
        <Paper
            elevation={2}
            sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'grey.50',
                width: 'fit-content',
            }}
        >
            <Stack spacing={2} alignItems="center">
                {/* Scanner Container */}
                <Box
                    ref={containerRef}
                    sx={{
                        width,
                        height,
                        bgcolor: isScanning ? 'black' : 'grey.200',
                        borderRadius: 2,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                    }}
                >
                    <div
                        id={scannerId.current}
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                    />

                    {!isScanning && !isLoading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <CameraAltIcon sx={{ fontSize: 48, color: 'grey.500' }} />
                            <Typography color="text.secondary" variant="body2">
                                Taramayı başlatın
                            </Typography>
                        </Box>
                    )}

                    {isLoading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <CircularProgress size={40} />
                            <Typography color="text.secondary" variant="body2">
                                Kamera açılıyor...
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Error Message */}
                {error && (
                    <Alert severity="error" sx={{ width: '100%' }}>
                        {error}
                    </Alert>
                )}

                {/* Controls */}
                <Stack direction="row" spacing={1}>
                    {!isScanning ? (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<CameraAltIcon />}
                            onClick={startScanning}
                            disabled={isLoading}
                        >
                            Taramayı Başlat
                        </Button>
                    ) : (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<StopIcon />}
                            onClick={stopScanning}
                        >
                            Durdur
                        </Button>
                    )}

                    {cameras.length > 1 && (
                        <Button
                            variant="outlined"
                            onClick={switchCamera}
                            disabled={isLoading}
                            startIcon={<FlipCameraIosIcon />}
                        >
                            Kamera Değiştir
                        </Button>
                    )}
                </Stack>

                {/* Camera Info */}
                {cameras.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                        📷 {cameras[currentCameraIndex]?.label || 'Kamera'}
                    </Typography>
                )}

                <Typography variant="caption" color="text.secondary" textAlign="center">
                    QR kodu kamera görüş alanına getirin
                </Typography>
            </Stack>
        </Paper>
    );
}

export default QRScanner;


