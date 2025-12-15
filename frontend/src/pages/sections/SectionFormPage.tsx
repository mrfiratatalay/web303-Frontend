import { yupResolver } from '@hookform/resolvers/yup';
import { Add, Delete } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { useEffect, useMemo, useState } from 'react';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import apiClient from '../../services/apiClient';
import { getClassrooms } from '../../services/classroomApi';
import { getCourses, normalizeCourseListResponse } from '../../services/courseApi';
import { createSection, extractData, getSectionById, updateSection } from '../../services/sectionApi';
import { Classroom, Course, ScheduleItem, Section } from '../../types/academics';
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

type FacultyOption = {
  id: string;
  name: string;
  email?: string;
};

const DAY_OPTIONS = [
  { value: 'Monday', label: 'Pazartesi' },
  { value: 'Tuesday', label: 'Salı' },
  { value: 'Wednesday', label: 'Çarşamba' },
  { value: 'Thursday', label: 'Perşembe' },
  { value: 'Friday', label: 'Cuma' },
  { value: 'Saturday', label: 'Cumartesi' },
  { value: 'Sunday', label: 'Pazar' },
];

const schema = Yup.object({
  course_id: Yup.string().required('Ders seçimi zorunlu'),
  section_number: Yup.string().max(10).required('Şube numarası zorunlu'),
  semester: Yup.string().oneOf(['fall', 'spring', 'summer']).required('Dönem zorunlu'),
  year: Yup.number().typeError('Yıl sayısal olmalı').min(2020).max(2100).required('Yıl zorunlu'),
  instructor_id: Yup.string().required('Eğitmen seçimi zorunlu'),
  capacity: Yup.number().typeError('Kapasite sayısal olmalı').min(1).max(500).required('Kapasite zorunlu'),
  classroom_id: Yup.string().nullable().optional(),
  schedule_json: Yup.array().of(
    Yup.object({
      day: Yup.string()
        .oneOf(DAY_OPTIONS.map((d) => d.value))
        .required('Gün zorunlu'),
      start_time: Yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'HH:MM formatı').required(),
      end_time: Yup.string().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'HH:MM formatı').required(),
    }),
  ),
});

const defaultScheduleRow: ScheduleItem = { day: 'Monday', start_time: '09:00', end_time: '10:00' };

const formatClassroomLabel = (room: Classroom) =>
  [room.building, room.room_number].filter(Boolean).join(' ') || 'Sınıf';

const validateScheduleRows = (rows: ScheduleItem[] = []) => {
  const byDay: Record<string, Array<{ start: number; end: number }>> = {};

  for (const row of rows) {
    const [startH, startM] = (row.start_time || '').split(':').map(Number);
    const [endH, endM] = (row.end_time || '').split(':').map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;

    if (Number.isNaN(start) || Number.isNaN(end)) {
      return 'Program saat formatı geçersiz';
    }
    if (start >= end) {
      return 'Programda bitiş saati başlangıçtan sonra olmalı';
    }

    byDay[row.day] = byDay[row.day] || [];
    for (const existing of byDay[row.day]) {
      const overlaps = start < existing.end && end > existing.start;
      if (overlaps) {
        return 'Aynı gün içinde çakışan saatler var';
      }
    }
    byDay[row.day].push({ start, end });
  }
  return null;
};

function SectionFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<FacultyOption[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: 'onChange',
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

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'schedule_json',
  });

  useEffect(() => {
    if (!isEdit) {
      append(defaultScheduleRow);
    }
  }, [append, isEdit]);

  useEffect(() => {
    const loadOptions = async () => {
      setOptionsLoading(true);
      try {
        const [coursesRes, facultyRes, classroomRes] = await Promise.allSettled([
          getCourses({ limit: 100 }),
          apiClient.get('/users', { params: { role: 'faculty', limit: 100 } }),
          getClassrooms(),
        ]);

        if (coursesRes.status === 'fulfilled') {
          const data = normalizeCourseListResponse(coursesRes.value, { limit: 100 });
          setCourses(data.courses || []);
        }

        if (facultyRes.status === 'fulfilled') {
          const rawFaculty = (facultyRes.value.data as { data?: { users?: any[] } })?.data?.users || [];
          setFaculty(
            rawFaculty.map((u) => ({
              id: u.id,
              name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'Eğitmen',
              email: u.email,
            })),
          );
        } else if (facultyRes.status === 'rejected') {
          setError(getErrorMessage(facultyRes.reason, 'Eğitmen listesi yüklenemedi.'));
        }

        if (classroomRes.status === 'fulfilled') {
          const raw = (classroomRes.value.data as { data?: Classroom[] })?.data || (classroomRes.value.data as Classroom[]);
          setClassrooms(raw || []);
        }
      } finally {
        setOptionsLoading(false);
      }
    };

    loadOptions();
  }, []);

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
          schedule_json: data.schedule_json && data.schedule_json.length > 0 ? data.schedule_json : [],
        });
        replace(data.schedule_json && data.schedule_json.length > 0 ? data.schedule_json : []);
      } catch (err) {
        setError(getErrorMessage(err, 'Şube yüklenemedi.'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit, reset, replace]);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setSaving(true);
    setError('');
    setSuccess('');

    const scheduleError = validateScheduleRows(values.schedule_json || []);
    if (scheduleError) {
      setError(scheduleError);
      setSaving(false);
      return;
    }

    const payload = {
      course_id: values.course_id,
      section_number: values.section_number,
      semester: values.semester,
      year: Number(values.year),
      instructor_id: values.instructor_id,
      capacity: Number(values.capacity),
      classroom_id: values.classroom_id || null,
      schedule_json: values.schedule_json || [],
    };

    try {
      if (isEdit && id) {
        await updateSection(id, payload);
        setSuccess('Şube güncellendi');
      } else {
        await createSection(payload);
        setSuccess('Şube oluşturuldu');
      }
      navigate('/sections');
    } catch (err) {
      setError(getErrorMessage(err, 'İşlem başarısız.'));
    } finally {
      setSaving(false);
    }
  };

  const termLabels: Record<FormValues['semester'], string> = useMemo(
    () => ({
      fall: 'Güz',
      spring: 'Bahar',
      summer: 'Yaz',
    }),
    [],
  );

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
        {isEdit ? 'Şubeyi Güncelle' : 'Yeni Şube'}
      </Typography>
      {error && <Alert variant="error" message={error} />}
      {success && <Alert variant="success" message={success} />}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="course_id"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      label="Ders"
                      value={field.value || ''}
                      onChange={field.onChange}
                      error={!!errors.course_id}
                      helperText={errors.course_id?.message}
                      disabled={optionsLoading || saving}
                    >
                      <MenuItem value="">
                        <em>Seçiniz</em>
                      </MenuItem>
                      {courses.map((course) => (
                        <MenuItem key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  label="Şube"
                  {...register('section_number')}
                  error={!!errors.section_number}
                  helperText={errors.section_number?.message}
                  disabled={saving}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <Controller
                  name="semester"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      label="Dönem"
                      value={field.value}
                      onChange={field.onChange}
                      error={!!errors.semester}
                      helperText={errors.semester?.message}
                      disabled={saving}
                    >
                      {(['fall', 'spring', 'summer'] as FormValues['semester'][]).map((term) => (
                        <MenuItem key={term} value={term}>
                          {termLabels[term]}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  type="number"
                  label="Yıl"
                  {...register('year', { valueAsNumber: true })}
                  error={!!errors.year}
                  helperText={errors.year?.message}
                  disabled={saving}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <Controller
                  name="instructor_id"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      label="Eğitmen"
                      value={field.value || ''}
                      onChange={field.onChange}
                      error={!!errors.instructor_id}
                      helperText={errors.instructor_id?.message}
                      disabled={optionsLoading || saving}
                    >
                      <MenuItem value="">
                        <em>Seçiniz</em>
                      </MenuItem>
                      {faculty.map((f) => (
                        <MenuItem key={f.id} value={f.id}>
                          {f.name}
                          {f.email ? ` (${f.email})` : ''}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
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
                  disabled={saving}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="classroom_id"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      label="Sınıf (opsiyonel)"
                      value={field.value || ''}
                      onChange={(event) => field.onChange(event.target.value || '')}
                      error={!!errors.classroom_id}
                      helperText={errors.classroom_id?.message}
                      disabled={optionsLoading || saving}
                    >
                      <MenuItem value="">
                        <em>Belirtilmedi</em>
                      </MenuItem>
                      {classrooms.map((room) => (
                        <MenuItem key={room.id} value={room.id}>
                          {formatClassroomLabel(room)}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
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
                  disabled={saving}
                >
                  Satır Ekle
                </Button>
              </Stack>
              <Stack spacing={1}>
                {fields.map((field, index) => (
                  <Grid container spacing={1} alignItems="center" key={field.id}>
                    <Grid item xs={12} md={3}>
                      <Controller
                        name={`schedule_json.${index}.day`}
                        control={control}
                        render={({ field: dayField }) => (
                          <TextField
                            select
                            fullWidth
                            label="Gün"
                            value={dayField.value || 'Monday'}
                            onChange={dayField.onChange}
                            error={!!errors.schedule_json?.[index]?.day}
                            helperText={errors.schedule_json?.[index]?.day?.message}
                            disabled={saving}
                          >
                            {DAY_OPTIONS.map((d) => (
                              <MenuItem key={d.value} value={d.value}>
                                {d.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>
                    <Grid item xs={6} md={2.5}>
                      <TextField
                        fullWidth
                        label="Başlangıç"
                        placeholder="09:00"
                        {...register(`schedule_json.${index}.start_time` as const)}
                        error={!!errors.schedule_json?.[index]?.start_time}
                        helperText={errors.schedule_json?.[index]?.start_time?.message}
                        disabled={saving}
                      />
                    </Grid>
                    <Grid item xs={6} md={2.5}>
                      <TextField
                        fullWidth
                        label="Bitiş"
                        placeholder="10:00"
                        {...register(`schedule_json.${index}.end_time` as const)}
                        error={!!errors.schedule_json?.[index]?.end_time}
                        helperText={errors.schedule_json?.[index]?.end_time?.message}
                        disabled={saving}
                      />
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <IconButton aria-label="sil" onClick={() => remove(index)} disabled={saving}>
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
              </Stack>
            </Box>

            <Stack direction="row" spacing={2} mt={3}>
              <Button type="submit" variant="contained" disabled={saving || !isValid || optionsLoading}>
                {saving ? <LoadingSpinner label="Kaydediliyor..." /> : 'Kaydet'}
              </Button>
              <Button variant="outlined" onClick={() => navigate(-1)} disabled={saving}>
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

