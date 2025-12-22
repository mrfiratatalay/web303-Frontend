import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
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
    Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Toast from '../../components/feedback/Toast';
import {
    getMealMenus,
    createMealMenu,
    updateMealMenu,
    deleteMealMenu,
    getCafeterias,
    extractData,
    normalizeMealMenuListResponse,
} from '../../services/mealApi';
import { MealMenu, Cafeteria } from '../../types/meals';
import { getErrorMessage } from '../../utils/error';

interface MenuFormData {
    cafeteria_id: string;
    date: string;
    meal_type: 'lunch' | 'dinner';
    items_json: { name: string; description?: string }[];
    nutrition_json: { calories?: number; protein?: number; carbs?: number; fat?: number };
    price: number;
    is_published: boolean;
}

const defaultFormData: MenuFormData = {
    cafeteria_id: '',
    date: new Date().toISOString().slice(0, 10),
    meal_type: 'lunch',
    items_json: [{ name: '' }],
    nutrition_json: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    price: 25,
    is_published: true,
};

function MenuManagementPage() {
    const [menus, setMenus] = useState<MealMenu[]>([]);
    const [cafeterias, setCafeterias] = useState<Cafeteria[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState<MealMenu | null>(null);
    const [formData, setFormData] = useState<MenuFormData>(defaultFormData);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' | 'info' | 'warning' });

    const loadData = async () => {
        setLoading(true);
        try {
            const [menusRes, cafeteriasRes] = await Promise.all([
                getMealMenus({ limit: 50 }),
                getCafeterias(),
            ]);

            const { menus: menuList } = normalizeMealMenuListResponse(menusRes);
            setMenus(menuList);

            const cafeteriaList = extractData<Cafeteria[]>(cafeteriasRes);
            setCafeterias(Array.isArray(cafeteriaList) ? cafeteriaList : []);
        } catch (err) {
            setError(getErrorMessage(err, 'Veriler yüklenemedi'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenDialog = (menu?: MealMenu) => {
        if (menu) {
            setEditingMenu(menu);
            setFormData({
                cafeteria_id: menu.cafeteria_id || '',
                date: menu.date || '',
                meal_type: (menu.meal_type as 'lunch' | 'dinner') || 'lunch',
                items_json: menu.items_json || [{ name: '' }],
                nutrition_json: menu.nutrition_json || {},
                price: menu.price || 25,
                is_published: menu.is_published ?? true,
            });
        } else {
            setEditingMenu(null);
            setFormData(defaultFormData);
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingMenu(null);
        setFormData(defaultFormData);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            if (editingMenu) {
                await updateMealMenu(editingMenu.id, formData);
                setToast({ open: true, message: 'Menü güncellendi', type: 'success' });
            } else {
                await createMealMenu(formData);
                setToast({ open: true, message: 'Menü oluşturuldu', type: 'success' });
            }
            handleCloseDialog();
            loadData();
        } catch (err) {
            setToast({ open: true, message: getErrorMessage(err, 'İşlem başarısız'), type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu menüyü silmek istediğinize emin misiniz?')) return;

        try {
            await deleteMealMenu(id);
            setToast({ open: true, message: 'Menü silindi', type: 'success' });
            loadData();
        } catch (err) {
            setToast({ open: true, message: getErrorMessage(err, 'Silme başarısız'), type: 'error' });
        }
    };

    const addMenuItem = () => {
        setFormData((prev) => ({
            ...prev,
            items_json: [...prev.items_json, { name: '' }],
        }));
    };

    const updateMenuItem = (index: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            items_json: prev.items_json.map((item, i) =>
                i === index ? { ...item, name: value } : item
            ),
        }));
    };

    const removeMenuItem = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            items_json: prev.items_json.filter((_, i) => i !== index),
        }));
    };

    return (
        <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight={800}>
                    Menü Yönetimi
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Yeni Menü
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
                                        <TableCell>Tarih</TableCell>
                                        <TableCell>Yemekhane</TableCell>
                                        <TableCell>Öğün</TableCell>
                                        <TableCell>Yemekler</TableCell>
                                        <TableCell>Fiyat</TableCell>
                                        <TableCell>Durum</TableCell>
                                        <TableCell align="right">İşlem</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {menus.map((menu) => (
                                        <TableRow key={menu.id}>
                                            <TableCell>{menu.date}</TableCell>
                                            <TableCell>
                                                {cafeterias.find((c) => c.id === menu.cafeteria_id)?.name || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={menu.meal_type === 'lunch' ? 'Öğle' : 'Akşam'}
                                                    size="small"
                                                    color={menu.meal_type === 'lunch' ? 'primary' : 'secondary'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {menu.items_json?.map((i) => i.name).join(', ') || '-'}
                                            </TableCell>
                                            <TableCell>{menu.price} ₺</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={menu.is_published ? 'Yayında' : 'Taslak'}
                                                    size="small"
                                                    color={menu.is_published ? 'success' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => handleOpenDialog(menu)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(menu.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {!menus.length && (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">
                                                <Typography color="text.secondary">Menü bulunamadı</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* Menu Form Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingMenu ? 'Menü Düzenle' : 'Yeni Menü'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <FormControl fullWidth>
                            <InputLabel>Yemekhane</InputLabel>
                            <Select
                                value={formData.cafeteria_id}
                                label="Yemekhane"
                                onChange={(e) => setFormData((p) => ({ ...p, cafeteria_id: e.target.value }))}
                            >
                                {cafeterias.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>
                                        {c.name}
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

                        <FormControl fullWidth>
                            <InputLabel>Öğün</InputLabel>
                            <Select
                                value={formData.meal_type}
                                label="Öğün"
                                onChange={(e) =>
                                    setFormData((p) => ({ ...p, meal_type: e.target.value as 'lunch' | 'dinner' }))
                                }
                            >
                                <MenuItem value="lunch">Öğle</MenuItem>
                                <MenuItem value="dinner">Akşam</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Fiyat (₺)"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                            fullWidth
                        />

                        <Typography variant="subtitle2">Yemekler</Typography>
                        {formData.items_json.map((item, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    size="small"
                                    placeholder={`Yemek ${index + 1}`}
                                    value={item.name}
                                    onChange={(e) => updateMenuItem(index, e.target.value)}
                                    fullWidth
                                />
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => removeMenuItem(index)}
                                    disabled={formData.items_json.length <= 1}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                        <Button size="small" onClick={addMenuItem}>
                            + Yemek Ekle
                        </Button>
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

export default MenuManagementPage;
