import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Alert from '../../components/feedback/Alert';
import { ScheduleItem, Section } from '../../types/academics';
import { createSection, extractData, getSectionById, updateSection } from '../../services/sectionApi';
import { getErrorMessage } from '../../utils/error';

type FormValues = {
  course_id: string;
  section_number: string;
  semester: 'fall' | 'spring' | 'summer';
  year: number;
  instructor_id: string;
  capacity: number;
  classroom_id?: string | null;
  schedule_json: ScheduleItem[];
};

const schema = Yup.object({
  course_id: Yup.string().required('Course ID zorunlu'),
  section_number: Yup.string().max(10).required('Section numarası zorunlu'),
  semester: Yup.string().oneOf(['fall', 'spring', 'summer']).required('Dönem zorunlu'),
  year: Yup.number().typeError('Yıl sayı olmalı').min(2020).max(2100).required('Yıl zorunlu'),
  instructor_id: Yup.string().required('Eğitmen ID zorunlu'),
  capacity: Yup.number().typeError('Kapasite sayı olmalı').min(1).max(500).required('Kapasite zorunlu'),
  classroom_id: Yup.string().nullable().optional(),
  schedule_json: Yup.array().of(
    Yup.object({
      day: Yup.string()
        .oneOf(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
        .required('Gün zorunlu'),
      start_time: Yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'HH:MM formatı').required(),
      end_time: Yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'HH:MM formatı').required(),
    }),
  ),
});

const defaultScheduleRow: ScheduleItem = { day: 'Monday', start_time: '09:00', end_time: '10:00' };

function SectionFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      course_id: '',
      section_number: '01',
      semester: 'fall',
      year: new Date().getFullYear(),
      instructor_id: '',
      capacity: 30,
      classroom_id: '',
      schedule_json: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'schedule_json',
  });

  useEffect(() => {
    const load = async () => {
      if (!isEdit || !id) return;
      setLoading(true);
      setError('');
      try {
        const response = await getSectionById(id);
        const data = extractData<Section>(response);
        reset({
          course_id: data.course_id,
          section_number: data.section_number,
          semester: data.semester,
          year: data.year,
          instructor_id: data.instructor_id,
          capacity: data.capacity,
          classroom_id: data.classroom_id || '',
          schedule_json: data.schedule_json || [],
        });
      } catch (err) {
        setError(getErrorMessage(err, 'Section yüklenemedi.'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit, reset]);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (isEdit && id) {
        const response = await updateSection(id, values);
        const data = extractData<Section>(response);
        setSuccess('Section güncellendi');
        navigate(`/sections/${data.id}`);
      } else {
        const response = await createSection(values);
        const data = extractData<Section>(response);
        setSuccess('Section oluşturuldu');
        navigate(`/sections/${data.id}`);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'İşlem başarısız.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box py={4}>
        <LoadingSpinner label="Yükleniyor..." />
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        {isEdit ? 'Section Güncelle' : 'Yeni Section'}
      </Typography>
      {error && <Alert variant="error" message={error} />}
      {success && <Alert variant="success" message={success} />}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Course ID"
                  {...register('course_id')}
                  error={!!errors.course_id}
                  helperText={errors.course_id?.message}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  label="Section"
                  {...register('section_number')}
                  error={!!errors.section_number}
                  helperText={errors.section_number?.message}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Dönem"
                  defaultValue="fall"
                  {...register('semester')}
                  error={!!errors.semester}
                  helperText={errors.semester?.message}
                >
                  <MenuItem value="fall">Fall</MenuItem>
                  <MenuItem value="spring">Spring</MenuItem>
                  <MenuItem value="summer">Summer</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Yıl"
                  {...register('year', { valueAsNumber: true })}
                  error={!!errors.year}
                  helperText={errors.year?.message}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  label="Eğitmen ID"
                  {...register('instructor_id')}
                  error={!!errors.instructor_id}
                  helperText={errors.instructor_id?.message}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Kapasite"
                  {...register('capacity', { valueAsNumber: true })}
                  error={!!errors.capacity}
                  helperText={errors.capacity?.message}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Classroom ID"
                  {...register('classroom_id')}
                  error={!!errors.classroom_id}
                  helperText={errors.classroom_id?.message}
                />
              </Grid>
            </Grid>

            <Box mt={3}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1">Program</Typography>
                <Button
                  startIcon={<Add />}
                  size="small"
                  variant="outlined"
                  onClick={() => append(defaultScheduleRow)}
                >
                  Satır Ekle
                </Button>
              </Stack>
              <Stack spacing={1}>
                {fields.map((field, index) => (
                  <Grid container spacing={1} alignItems="center" key={field.id}>
                    <Grid item xs={4} md={2.5}>
                      <TextField
                        select
                        fullWidth
                        label="Gün"
                        defaultValue={field.day}
                        {...register(`schedule_json.${index}.day` as const)}
                        error={!!errors.schedule_json?.[index]?.day}
                        helperText={errors.schedule_json?.[index]?.day?.message}
                      >
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                          <MenuItem key={d} value={d}>
                            {d}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={3} md={2}>
                      <TextField
                        fullWidth
                        label="Başlangıç"
                        placeholder="09:00"
                        {...register(`schedule_json.${index}.start_time` as const)}
                        error={!!errors.schedule_json?.[index]?.start_time}
                        helperText={errors.schedule_json?.[index]?.start_time?.message}
                      />
                    </Grid>
                    <Grid item xs={3} md={2}>
                      <TextField
                        fullWidth
                        label="Bitiş"
                        placeholder="10:00"
                        {...register(`schedule_json.${index}.end_time` as const)}
                        error={!!errors.schedule_json?.[index]?.end_time}
                        helperText={errors.schedule_json?.[index]?.end_time?.message}
                      />
                    </Grid>
                    <Grid item xs={2} md={1}>
                      <IconButton aria-label="sil" onClick={() => remove(index)}>
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
              </Stack>
            </Box>

            <Stack direction="row" spacing={2} mt={3}>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? <LoadingSpinner label="Kaydediliyor..." /> : 'Kaydet'}
              </Button>
              <Button variant="outlined" onClick={() => navigate(-1)}>
                Geri
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default SectionFormPage;
