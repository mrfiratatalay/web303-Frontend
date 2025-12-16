import { Add, Delete } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useState } from 'react';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { bulkEnterGrades } from '../../services/gradeApi';
import { getErrorMessage } from '../../utils/error';

type GradeRow = { enrollment_id: string; midterm_grade?: string; final_grade?: string };

function FacultyGradeBulkPage() {
  const [rows, setRows] = useState<GradeRow[]>([{ enrollment_id: '', midterm_grade: '', final_grade: '' }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (index: number, field: keyof GradeRow, value: string) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const addRow = () => setRows((prev) => [...prev, { enrollment_id: '', midterm_grade: '', final_grade: '' }]);
  const removeRow = (index: number) => setRows((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await bulkEnterGrades(
        rows
          .filter((r) => r.enrollment_id)
          .map((r) => ({
            enrollment_id: r.enrollment_id,
            midterm_grade: r.midterm_grade === '' ? null : Number(r.midterm_grade),
            final_grade: r.final_grade === '' ? null : Number(r.final_grade),
          })),
      );
      setMessage('Toplu not girişi tamamlandı.');
    } catch (err) {
      setError(getErrorMessage(err, 'Toplu not girilemedi.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Toplu Not Girişi
      </Typography>
      {message && <Alert variant="success" message={message} />}
      {error && <Alert variant="error" message={error} />}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            {rows.map((row, idx) => (
              <Grid container spacing={1} alignItems="center" key={idx}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Kayıt ID"
                    value={row.enrollment_id}
                    onChange={(e) => handleChange(idx, 'enrollment_id', e.target.value)}
                  />
                </Grid>
                <Grid item xs={5.5} md={3}>
                  <TextField
                    fullWidth
                    label="Vize"
                    type="number"
                    value={row.midterm_grade}
                    onChange={(e) => handleChange(idx, 'midterm_grade', e.target.value)}
                  />
                </Grid>
                <Grid item xs={5.5} md={3}>
                  <TextField
                    fullWidth
                    label="Final"
                    type="number"
                    value={row.final_grade}
                    onChange={(e) => handleChange(idx, 'final_grade', e.target.value)}
                  />
                </Grid>
                <Grid item xs={1} md={1}>
                  <IconButton aria-label="Sil" onClick={() => removeRow(idx)} disabled={rows.length === 1}>
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Box>
              <Button startIcon={<Add />} variant="outlined" size="small" onClick={addRow}>
                Satır ekle
              </Button>
            </Box>
            <Box>
              <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                {loading ? <LoadingSpinner label="Gönderiliyor..." /> : 'Gönder'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default FacultyGradeBulkPage;

