import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Alert from '../../components/feedback/Alert';
import { getUserById, getUsers } from '../../services/userApi';
import apiClient from '../../services/apiClient';
import { User } from '../../types/auth';
import { Pagination, UserListQuery, UserListResult } from '../../types/users';
import { getErrorMessage } from '../../utils/error';

type DepartmentOption = { id: string; name: string; code?: string; faculty?: string };

const unwrap = <T,>(response: { data?: { data?: T } | T } | T): T =>
  (response as { data?: { data?: T } })?.data?.data ??
  (response as { data?: T })?.data ??
  (response as T);

const DEFAULT_QUERY: UserListQuery = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const roleLabels: Record<string, string> = {
  student: 'Ogrenci',
  faculty: 'Akademisyen',
  admin: 'Yonetici',
};

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' })
    : '-';

function getDepartmentName(user: User) {
  if (user.role === 'student') {
    return user.student?.department?.name || '-';
  }
  if (user.role === 'faculty') {
    return user.faculty?.department?.name || '-';
  }
  return user.student?.department?.name || user.faculty?.department?.name || '-';
}

function getFullName(user: User) {
  const first = user.first_name || user.firstName || '';
  const last = user.last_name || user.lastName || '';
  const full = `${first} ${last}`.trim();
  return full || user.email;
}

function UserManagementPage() {
  const [query, setQuery] = useState<UserListQuery>(DEFAULT_QUERY);
  const [searchInput, setSearchInput] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [departmentError, setDepartmentError] = useState('');

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [detailError, setDetailError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);

  // Debounce search input to limit API calls
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery((prev) => ({ ...prev, page: 1, search: searchInput.trim() || undefined }));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadDepartments = useCallback(async () => {
    try {
      setDepartmentError('');
      const response = await apiClient.get<DepartmentOption[] | { data?: DepartmentOption[] }>('/departments');
      const data = unwrap<DepartmentOption[] | { data?: DepartmentOption[] }>(response);
      const list = Array.isArray(data) ? data : data?.data;
      if (Array.isArray(list)) {
        setDepartments(list);
      } else {
        setDepartments([]);
        setDepartmentError('Bolumler alinmadi.');
      }
    } catch (err) {
      setDepartments([]);
      setDepartmentError(getErrorMessage(err, 'Bolumler alinmadi.'));
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getUsers(query);
      const data = unwrap<UserListResult>(response);
      setUsers(Array.isArray(data.users) ? data.users : []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(getErrorMessage(err, 'Kullanici listesi alinmadi.'));
      setUsers([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handlePageChange = (_: unknown, newPage: number) => {
    setQuery((prev) => ({ ...prev, page: newPage + 1 }));
  };

  const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const limit = parseInt(event.target.value, 10);
    setQuery((prev) => ({ ...prev, page: 1, limit }));
  };

  const handleRoleChange = (event: ChangeEvent<{ value: unknown }>) => {
    const role = event.target.value as UserListQuery['role'] | 'all';
    setQuery((prev) => ({
      ...prev,
      page: 1,
      role: role === 'all' ? undefined : role,
    }));
  };

  const handleDepartmentChange = (event: ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    setQuery((prev) => ({
      ...prev,
      page: 1,
      departmentId: value || undefined,
    }));
  };

  const handleSortByChange = (event: ChangeEvent<{ value: unknown }>) => {
    const sortBy = event.target.value as UserListQuery['sortBy'];
    setQuery((prev) => ({ ...prev, sortBy }));
  };

  const handleSortOrderChange = (event: ChangeEvent<{ value: unknown }>) => {
    const sortOrder = event.target.value as UserListQuery['sortOrder'];
    setQuery((prev) => ({ ...prev, sortOrder }));
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setQuery(DEFAULT_QUERY);
  };

  const handleRefresh = () => loadUsers();

  const openUserDetail = async (userId: string) => {
    setDetailOpen(true);
    setDetailUser(null);
    setDetailError('');
    setDetailLoading(true);
    try {
      const response = await getUserById(userId);
      const data = unwrap<User>(response);
      setDetailUser(data);
    } catch (err) {
      setDetailError(getErrorMessage(err, 'Kullanici detayi alinmadi.'));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailUser(null);
    setDetailError('');
  };

  const sortedByLabel = useMemo(() => {
    if (query.sortBy === 'firstName') return 'Isim';
    if (query.sortBy === 'lastName') return 'Soyisim';
    if (query.sortBy === 'email') return 'E-posta';
    return 'Olusturulma';
  }, [query.sortBy]);

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <div>
          <Typography variant="h5" fontWeight={800}>
            Kullanici Yonetimi
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Admin kullanicilar icin listeleme, filtreleme ve detay gosterme
          </Typography>
        </div>
        <Button variant="outlined" size="small" onClick={handleRefresh}>
          Yenile
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Kullanici ara"
              placeholder="Isim veya e-posta"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="role-filter-label">Rol</InputLabel>
              <Select
                labelId="role-filter-label"
                label="Rol"
                value={query.role || 'all'}
                onChange={handleRoleChange}
              >
                <MenuItem value="all">Tumu</MenuItem>
                <MenuItem value="student">Ogrenci</MenuItem>
                <MenuItem value="faculty">Akademisyen</MenuItem>
                <MenuItem value="admin">Yonetici</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="department-filter-label">Bolum</InputLabel>
              <Select
                labelId="department-filter-label"
                label="Bolum"
                value={query.departmentId || ''}
                onChange={handleDepartmentChange}
              >
                <MenuItem value="">Tumu</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-by-label">Sirala</InputLabel>
              <Select
                labelId="sort-by-label"
                label="Sirala"
                value={query.sortBy}
                onChange={handleSortByChange}
              >
                <MenuItem value="createdAt">Olusturulma</MenuItem>
                <MenuItem value="firstName">Isim</MenuItem>
                <MenuItem value="lastName">Soyisim</MenuItem>
                <MenuItem value="email">E-posta</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-order-label">Siralama</InputLabel>
              <Select
                labelId="sort-order-label"
                label="Siralama"
                value={query.sortOrder}
                onChange={handleSortOrderChange}
              >
                <MenuItem value="desc">Azalan</MenuItem>
                <MenuItem value="asc">Artan</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1.5}>
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              <Button variant="outlined" size="small" onClick={handleResetFilters}>
                Sifirla
              </Button>
            </Stack>
          </Grid>
        </Grid>
        {departmentError && (
          <Box mt={1.5}>
            <Alert variant="error" message={departmentError} />
          </Box>
        )}
        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          Siralama: {sortedByLabel} ({query.sortOrder === 'asc' ? 'artan' : 'azalan'})
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        {error && (
          <Box p={2}>
            <Alert variant="error" message={error} />
          </Box>
        )}
        {isLoading ? (
          <Box py={4}>
            <LoadingSpinner label="Kullanicilar yukleniyor..." />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ad Soyad</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Bolum</TableCell>
                    <TableCell>Durum</TableCell>
                    <TableCell>Kayit</TableCell>
                    <TableCell align="right">Islem</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Stack spacing={0.25}>
                          <Typography fontWeight={700}>{getFullName(user)}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={roleLabels[user.role] || user.role}
                          size="small"
                          color={user.role === 'admin' ? 'secondary' : 'primary'}
                          variant={user.role === 'admin' ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>{getDepartmentName(user)}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.is_active || user.isActive ? 'Aktif' : 'Pasif'}
                          color={user.is_active || user.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt || user.created_at)}</TableCell>
                      <TableCell align="right">
                        <Button variant="outlined" size="small" onClick={() => openUserDetail(user.id)}>
                          Detay
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!users.length && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">Kayit bulunamadi.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={pagination?.totalItems || 0}
              page={(query.page || 1) - 1}
              onPageChange={handlePageChange}
              rowsPerPage={query.limit || 10}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[5, 10, 20]}
            />
          </>
        )}
      </Paper>

      <Dialog open={detailOpen} onClose={closeDetail} maxWidth="sm" fullWidth>
        <DialogTitle>Kullanici Detayi</DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box py={3}>
              <LoadingSpinner label="Detay yukleniyor..." />
            </Box>
          ) : detailError ? (
            <Alert variant="error" message={detailError} />
          ) : detailUser ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" fontWeight={800}>
                  {getFullName(detailUser)}
                </Typography>
                <Chip label={detailUser.email} size="small" />
              </Stack>
              <Divider />
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Rol
                  </Typography>
                  <Typography>{roleLabels[detailUser.role] || detailUser.role}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Durum
                  </Typography>
                  <Typography>{detailUser.is_active || detailUser.isActive ? 'Aktif' : 'Pasif'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Telefon
                  </Typography>
                  <Typography>{detailUser.phone || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Bolum
                  </Typography>
                  <Typography>{getDepartmentName(detailUser)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Kayit Tarihi
                  </Typography>
                  <Typography>{formatDate(detailUser.createdAt || detailUser.created_at)}</Typography>
                </Grid>
                {detailUser.role === 'student' && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Ogrenci No
                    </Typography>
                    <Typography>{detailUser.student?.student_number || '-'}</Typography>
                  </Grid>
                )}
                {detailUser.role === 'faculty' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Personel No
                      </Typography>
                      <Typography>{detailUser.faculty?.employee_number || '-'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Unvan
                      </Typography>
                      <Typography>{detailUser.faculty?.title || '-'}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Stack>
          ) : (
            <Typography color="text.secondary">Kullanici detayi bulunamadi.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetail}>Kapat</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default UserManagementPage;

