import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Switch,
    FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Toast from '../../components/feedback/Toast';
import {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    extractData,
} from '../../services/eventApi';
import { Event } from '../../types/events';
import { getErrorMessage } from '../../utils/error';

interface EventFormData {
    title: string;
    description: string;
    category: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    capacity: number;
    is_paid: boolean;
    price: number;
    registration_deadline: string;
    status: 'draft' | 'published' | 'cancelled';
}

const defaultFormData: EventFormData = {
    title: '',
    description: '',
    category: 'workshop',
    date: new Date().toISOString().slice(0, 10),
    start_time: '10:00',
    end_time: '12:00',
    location: '',
    capacity: 50,
    is_paid: false,
    price: 0,
    registration_deadline: '',
    status: 'published',
};

const categoryOptions = [
    { value: 'workshop', label: 'Workshop' },
    { value: 'conference', label: 'Konferans' },
    { value: 'social', label: 'Sosyal' },
    { value: 'sports', label: 'Spor' },
    { value: 'career', label: 'Kariyer' },
    { value: 'other', label: 'Diğer' },
];

function EventManagementPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [formData, setFormData] = useState<EventFormData>(defaultFormData);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' | 'info' | 'warning' });

    const loadEvents = async () => {
        setLoading(true);
        try {
            const response = await getEvents({ limit: 50 });
            const data = extractData<Event[] | { events: Event[] }>(response);
            const eventList = Array.isArray(data) ? data : data?.events || [];
            setEvents(eventList);
        } catch (err) {
            setError(getErrorMessage(err, 'Etkinlikler yüklenemedi'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const handleOpenDialog = (event?: Event) => {
        if (event) {
            setEditingEvent(event);
            setFormData({
                title: event.title || '',
                description: event.description || '',
                category: event.category || 'workshop',
                date: event.date || '',
                start_time: event.start_time || '10:00',
                end_time: event.end_time || '12:00',
                location: event.location || '',
                capacity: event.capacity || 50,
                is_paid: event.is_paid || false,
                price: event.price || 0,
                registration_deadline: event.registration_deadline || '',
                status: event.status || 'published',
            });
        } else {
            setEditingEvent(null);
            setFormData(defaultFormData);
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingEvent(null);
        setFormData(defaultFormData);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            if (editingEvent) {
                await updateEvent(editingEvent.id, formData);
                setToast({ open: true, message: 'Etkinlik güncellendi', type: 'success' });
            } else {
                await createEvent(formData);
                setToast({ open: true, message: 'Etkinlik oluşturuldu', type: 'success' });
            }
            handleCloseDialog();
            loadEvents();
        } catch (err) {
            setToast({ open: true, message: getErrorMessage(err, 'İşlem başarısız'), type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return;

        try {
            await deleteEvent(id);
            setToast({ open: true, message: 'Etkinlik silindi', type: 'success' });
            loadEvents();
        } catch (err) {
            setToast({ open: true, message: getErrorMessage(err, 'Silme başarısız'), type: 'error' });
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
            workshop: 'primary',
            conference: 'secondary',
            social: 'success',
            sports: 'warning',
            career: 'info',
        };
        return colors[category] || 'default';
    };

    return (
        <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight={800}>
                    Etkinlik Yönetimi
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                    Yeni Etkinlik
                </Button>
            </Box>

            {error && <Alert variant="error" message={error} />}
            <Toast
                open={toast.open}
                onClose={() => setToast((p) => ({ ...p, open: false }))}
                type={toast.type}
                message={toast.message}
            />

            {loading ? (
                <LoadingSpinner label="Yükleniyor..." />
            ) : (
                <Card>
                    <CardContent>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Başlık</TableCell>
                                        <TableCell>Tarih</TableCell>
                                        <TableCell>Kategori</TableCell>
                                        <TableCell>Konum</TableCell>
                                        <TableCell>Kapasite</TableCell>
                                        <TableCell>Durum</TableCell>
                                        <TableCell align="right">İşlem</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {events.map((event) => (
                                        <TableRow key={event.id}>
                                            <TableCell>
                                                <Typography fontWeight={600}>{event.title}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {event.date}
                                                <br />
                                                <Typography variant="caption" color="text.secondary">
                                                    {event.start_time} - {event.end_time}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={categoryOptions.find((c) => c.value === event.category)?.label || event.category}
                                                    size="small"
                                                    color={getCategoryColor(event.category)}
                                                />
                                            </TableCell>
                                            <TableCell>{event.location}</TableCell>
                                            <TableCell>
                                                {event.registered_count || 0}/{event.capacity}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={event.status === 'published' ? 'Yayında' : event.status}
                                                    size="small"
                                                    color={event.status === 'published' ? 'success' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => handleOpenDialog(event)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(event.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {!events.length && (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                <Typography color="text.secondary">Etkinlik bulunamadı</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* Event Form Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingEvent ? 'Etkinlik Düzenle' : 'Yeni Etkinlik'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Başlık"
                            value={formData.title}
                            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                            fullWidth
                            required
                        />

                        <TextField
                            label="Açıklama"
                            value={formData.description}
                            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                            fullWidth
                            multiline
                            rows={3}
                        />

                        <FormControl fullWidth>
                            <InputLabel>Kategori</InputLabel>
                            <Select
                                value={formData.category}
                                label="Kategori"
                                onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                            >
                                {categoryOptions.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Tarih"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Başlangıç"
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => setFormData((p) => ({ ...p, start_time: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            <TextField
                                label="Bitiş"
                                type="time"
                                value={formData.end_time}
                                onChange={(e) => setFormData((p) => ({ ...p, end_time: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Box>

                        <TextField
                            label="Konum"
                            value={formData.location}
                            onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                            fullWidth
                        />

                        <TextField
                            label="Kapasite"
                            type="number"
                            value={formData.capacity}
                            onChange={(e) => setFormData((p) => ({ ...p, capacity: parseInt(e.target.value) || 0 }))}
                            fullWidth
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.is_paid}
                                    onChange={(e) => setFormData((p) => ({ ...p, is_paid: e.target.checked }))}
                                />
                            }
                            label="Ücretli etkinlik"
                        />

                        {formData.is_paid && (
                            <TextField
                                label="Ücret (₺)"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                                fullWidth
                            />
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>İptal</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}

export default EventManagementPage;
