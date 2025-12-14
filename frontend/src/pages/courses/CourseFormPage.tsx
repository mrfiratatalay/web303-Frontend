import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import * as Yup from 'yup';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import apiClient from '../../services/apiClient';
import { CoursePayload, createCourse, extractData, getCourseById, getCourses, normalizeCourseListResponse, updateCourse } from '../../services/courseApi';
import { Course, Department } from '../../types/academics';
import { getErrorMessage } from '../../utils/error';

type FormValues = {
  code: string;
  name: string;
  description?: string;
  credits: number;
  ects: number;
  syllabus_url?: string;
  department_id: string;
  prerequisite_ids: string[];
};

const schema: Yup.ObjectSchema<FormValues> = Yup.object({
  code: Yup.string().min(3).max(20).required('Kod zorunlu'),
  name: Yup.string().min(3).max(200).required('İsim zorunlu'),
  description: Yup.string().max(2000).optional(),
  credits: Yup.number().typeError('Kredi sayı olmalı').min(1).max(10).required('Kredi zorunlu'),
  ects: Yup.number().typeError('ECTS sayı olmalı').min(1).max(30).required('ECTS zorunlu'),
  syllabus_url: Yup.string().url('Geçerli bir URL girin').optional(),
  department_id: Yup.string().required('Bölüm zorunlu'),
  prerequisite_ids: Yup.array().of(Yup.string().required()).default([]),
});

const unwrapDepartments = (response: unknown): Department[] => {
  if (Array.isArray(response)) return response;
  const typed = response as { data?: Department[] | { data?: Department[] } };
  if (Array.isArray(typed?.data)) return typed.data;
  if (Array.isArray((typed?.data as { data?: Department[] })?.data)) return (typed.data as { data: Department[] }).data;
  return [];
};

function CourseFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      credits: 3,
      ects: 5,
      syllabus_url: '',
      department_id: '',
      prerequisite_ids: [],
    },
  });

  useEffect(() => {
    const loadDeps = async () => {
      try {
        const response = await apiClient.get<Department[] | { data?: Department[] }>('/departments');
        setDepartments(unwrapDepartments(response.data as Department[] | { data?: Department[] }));
      } catch (err) {
        // ignore
      }
    };
    loadDeps();
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await getCourses({ limit: 100 });
        const data = normalizeCourseListResponse(response, { limit: 100 });
        setAvailableCourses(data.courses);
      } catch (err) {
        // ignore
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    const loadCourse = async () => {
      if (!isEdit || !id) return;
      setLoading(true);
      setError('');
      try {
        const response = await getCourseById(id);
        const data = extractData<Course>(response);
        reset({
          code: data.code,
          name: data.name,
          description: data.description || '',
          credits: data.credits,
          ects: data.ects,
          syllabus_url: data.syllabus_url || '',
          department_id: data.department_id,
          prerequisite_ids: (data.prerequisites || []).map((p) => p.id),
        });
      } catch (err) {
        setError(getErrorMessage(err, 'Ders yüklenemedi.'));
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [id, isEdit, reset]);

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setSaving(true);
    setError('');
    setSuccess('');
    const payload: CoursePayload = {
      code: values.code,
      name: values.name,
      description: values.description || '',
      credits: Number(values.credits),
      ects: Number(values.ects),
      syllabus_url: values.syllabus_url || '',
      department_id: values.department_id,
      prerequisite_ids: values.prerequisite_ids || [],
    };

    try {
      if (isEdit && id) {
        const response = await updateCourse(id, payload);
        const data = extractData<Course>(response);
        setSuccess('Ders güncellendi');
        navigate(`/courses/${data.id}`);
      } else {
        const response = await createCourse(payload);
        const data = extractData<Course>(response);
        setSuccess('Ders oluşturuldu');
        navigate(`/courses/${data.id}`);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'İşlem başarısız.'));
    } finally {
      setSaving(false);
    }
  };

  const filteredPrereqOptions = useMemo(
    () => availableCourses.filter((c) => !isEdit || c.id !== id),
    [availableCourses, id, isEdit],
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
        {isEdit ? 'Ders Güncelle' : 'Yeni Ders'}
      </Typography>
      {error && <Alert variant="error" message={error} />}
      {success && <Alert variant="success" message={success} />}

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
                <TextField
                  select
                  fullWidth
                  label="Bölüm"
                  defaultValue=""
                  {...register('department_id')}
                  error={!!errors.department_id}
                  helperText={errors.department_id?.message}
                >
                  <MenuItem value="">
                    <em>Seçin</em>
                  </MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={12}>
                <Controller
                  name="prerequisite_ids"
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <TextField
                      select
                      fullWidth
                      SelectProps={{ multiple: true }}
                      label="Önkoşullar"
                      value={field.value || []}
                      onChange={field.onChange}
                      helperText="İsteğe bağlı"
                    >
                      {filteredPrereqOptions.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

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

export default CourseFormPage;
