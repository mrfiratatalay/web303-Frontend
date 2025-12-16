import { yupResolver } from '@hookform/resolvers/yup';
import Autocomplete from '@mui/material/Autocomplete';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useEffect, useMemo, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import Alert from '../../components/feedback/Alert';
import Toast from '../../components/feedback/Toast';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import apiClient from '../../services/apiClient';
import {
  CoursePayload,
  createCourse,
  extractData,
  getCourseById,
  getCourses,
  normalizeCourseListResponse,
  updateCourse,
} from '../../services/courseApi';
import { Course, Department } from '../../types/academics';
import { getErrorMessage } from '../../utils/error';

type CourseOption = Pick<Course, 'id' | 'code' | 'name'>;

type FormValues = {
  code: string;
  name: string;
  description?: string;
  credits: number;
  ects: number;
  syllabus_url?: string;
  department_id: string;
  prerequisites: CourseOption[];
};

const schema: Yup.ObjectSchema<FormValues> = Yup.object({
  code: Yup.string().min(3).max(20).required('Kod zorunlu'),
  name: Yup.string().min(3).max(200).required('İsim zorunlu'),
  description: Yup.string().max(2000).optional(),
  credits: Yup.number().typeError('Kredi sayısı olmalı').min(1).max(10).required('Kredi zorunlu'),
  ects: Yup.number().typeError('ECTS sayısı olmalı').min(1).max(30).required('ECTS zorunlu'),
  syllabus_url: Yup.string().url('Geçerli bir URL girin').optional(),
  department_id: Yup.string().required('Bölüm zorunlu'),
  prerequisites: Yup.array()
    .of(
      Yup.object({
        id: Yup.string().required(),
        code: Yup.string().required(),
        name: Yup.string().required(),
      }),
    )
    .default([]),
});

const unwrapDepartments = (response: unknown): Department[] => {
  if (Array.isArray(response)) return response;
  const typed = response as { data?: Department[] | { data?: Department[] } };
  if (Array.isArray(typed?.data)) return typed.data;
  if (Array.isArray((typed?.data as { data?: Department[] })?.data)) return (typed.data as { data: Department[] }).data;
  return [];
};

const toCourseOptions = (courses: Course[]): CourseOption[] =>
  courses.map((c) => ({ id: c.id, code: c.code, name: c.name }));

const mergeCourseOptions = (current: CourseOption[], incoming: CourseOption[]) => {
  const map = new Map<string, CourseOption>();
  [...current, ...incoming].forEach((c) => map.set(c.id, c));
  return Array.from(map.values());
};

function CourseFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setErrorMessage] = useState('');
  const [toast, setToast] = useState<{ open: boolean; message: string; type: 'success' | 'info' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      code: '',
      name: '',
      description: '',
      credits: 3,
      ects: 5,
      syllabus_url: '',
      department_id: '',
      prerequisites: [],
    },
  });

  useEffect(() => {
    const loadDeps = async () => {
      try {
        const response = await apiClient.get<Department[] | { data?: Department[] }>('/departments');
        setDepartments(unwrapDepartments(response.data as Department[] | { data?: Department[] }));
      } catch (err) {
        // non-blocking
      }
    };
    loadDeps();
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await getCourses({ limit: 100 });
        const data = normalizeCourseListResponse(response, { limit: 100 });
        const options = toCourseOptions(data.courses);
        setAvailableCourses((prev) => mergeCourseOptions(prev, options));
      } catch (err) {
        // non-blocking
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    const loadCourse = async () => {
      if (!isEdit || !id) return;
      setLoading(true);
      setErrorMessage('');
      try {
        const response = await getCourseById(id);
        const data = extractData<Course>(response);
        const prereqOptions = toCourseOptions(data.prerequisites || []);
        setAvailableCourses((prev) => mergeCourseOptions(prev, prereqOptions));
        reset({
          code: data.code,
          name: data.name,
          description: data.description || '',
          credits: data.credits,
          ects: data.ects,
          syllabus_url: data.syllabus_url || '',
          department_id: data.department_id || '',
          prerequisites: prereqOptions,
        });
      } catch (err) {
        setErrorMessage(getErrorMessage(err, 'Ders yüklenemedi.'));
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [id, isEdit, reset]);

  const filteredPrereqOptions = useMemo(
    () => availableCourses.filter((c) => !isEdit || c.id !== id),
    [availableCourses, id, isEdit],
  );
  const hasPrereqOptions = filteredPrereqOptions.length > 0;

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setSaving(true);
    setErrorMessage('');

    const payload: CoursePayload = {
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description?.trim() || '',
      credits: Number(values.credits),
      ects: Number(values.ects),
      syllabus_url: values.syllabus_url?.trim() || '',
      department_id: values.department_id,
      prerequisite_ids: (values.prerequisites || []).map((p) => p.id),
    };

    try {
      if (isEdit && id) {
        const response = await updateCourse(id, payload);
        const data = extractData<Course>(response);
        setToast({ open: true, message: 'Ders güncellendi', type: 'success' });
        navigate(`/courses/${data.id}`);
      } else {
        await createCourse(payload);
        navigate('/courses', { state: { toast: { message: 'Ders oluşturuldu', type: 'success' } } });
      }
    } catch (err) {
      setErrorMessage(getErrorMessage(err, 'İşlem başarısız.'));
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
        {isEdit ? 'Ders Güncelle' : 'Yeni Ders'}
      </Typography>
      {error && <Alert variant="error" message={error} />}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Kod"
                  {...register('code')}
                  error={!!errors.code}
                  helperText={errors.code?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Ad"
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Açıklama"
                  multiline
                  minRows={3}
                  {...register('description')}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Kredi"
                  inputProps={{ min: 1, max: 10 }}
                  {...register('credits', { valueAsNumber: true })}
                  error={!!errors.credits}
                  helperText={errors.credits?.message}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="ECTS"
                  inputProps={{ min: 1, max: 30 }}
                  {...register('ects', { valueAsNumber: true })}
                  error={!!errors.ects}
                  helperText={errors.ects?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Syllabus URL"
                  {...register('syllabus_url')}
                  error={!!errors.syllabus_url}
                  helperText={errors.syllabus_url?.message}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="department_id"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Autocomplete
                      options={departments}
                      getOptionLabel={(option) => option.name || ''}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={departments.find((d) => d.id === field.value) || null}
                      onChange={(_, value) => {
                        clearErrors('department_id');
                        field.onChange(value?.id || '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Bölüm"
                          error={!!errors.department_id}
                          helperText={errors.department_id?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <Controller
                  name="prerequisites"
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <Autocomplete
                      multiple
                      options={filteredPrereqOptions}
                      filterSelectedOptions
                      getOptionLabel={(option) => `${option.code} - ${option.name}`}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={field.value || []}
                      onChange={(_, value) => {
                        clearErrors('prerequisites');
                        field.onChange(value || []);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Önkoşullar"
                          placeholder={hasPrereqOptions ? 'Seçiniz' : 'Eklenebilecek önkoşul yok'}
                          error={!!errors.prerequisites}
                          helperText={errors.prerequisites?.message || (hasPrereqOptions ? 'İsteğe bağlı' : undefined)}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} mt={3}>
              <Button type="submit" variant="contained" disabled={saving || !isValid}>
                {saving ? <LoadingSpinner label="Kaydediliyor..." /> : 'Kaydet'}
              </Button>
              <Button variant="outlined" onClick={() => navigate(-1)}>
                Geri
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>

      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </Stack>
  );
}

export default CourseFormPage;

