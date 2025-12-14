import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Divider,
    Grid,
    Stack,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { deleteCourse, extractData, getCourseById } from '../../services/courseApi';
import { Course, PrerequisiteNode } from '../../types/academics';
import { getErrorMessage } from '../../utils/error';

function renderPrerequisiteTree(node?: PrerequisiteNode | null) {
  if (!node) return null;
  return (
    <Box sx={{ pl: 2, borderLeft: '1px solid', borderColor: 'divider', mt: 1 }}>
      <Typography variant="body2" fontWeight={700}>
        {node.code} - {node.name}
      </Typography>
      {node.prerequisites?.map((child) => (
        <div key={child.courseId}>{renderPrerequisiteTree(child)}</div>
      ))}
    </Box>
  );
}

function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const response = await getCourseById(id);
        const data = extractData<Course>(response);
        setCourse(data);
      } catch (err) {
        setError(getErrorMessage(err, 'Ders yüklenemedi.'));
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteCourse(id);
      navigate('/courses');
    } catch (err) {
      setError(getErrorMessage(err, 'Silme işlemi başarısız.'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box py={4}>
        <LoadingSpinner label="Ders yükleniyor..." />
      </Box>
    );
  }

  if (error || !course) {
    return <Alert variant="error" message={error || 'Ders bulunamadı.'} />;
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={course.code} color="primary" />
          <Typography variant="h5" fontWeight={800}>
            {course.name}
          </Typography>
        </Stack>
        {user?.role === 'admin' && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              component={RouterLink}
              to={`/admin/courses/${course.id}/edit`}
            >
              Düzenle
            </Button>
            <Button variant="contained" color="error" size="small" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Siliniyor...' : 'Sil'}
            </Button>
          </Stack>
        )}
      </Stack>

      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Bölüm
              </Typography>
              <Typography>{course.department?.name || '-'}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Kredi / ECTS
              </Typography>
              <Typography>
                {course.credits} / {course.ects}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" color="text.secondary">
                Syllabus
              </Typography>
              {course.syllabus_url ? (
                <Button
                  component="a"
                  href={course.syllabus_url}
                  target="_blank"
                  rel="noreferrer"
                  size="small"
                >
                  Görüntüle
                </Button>
              ) : (
                <Typography>-</Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Açıklama
              </Typography>
              <Typography>{course.description || '—'}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Ön Koşullar" />
        <CardContent>
          {course.prerequisites && course.prerequisites.length > 0 ? (
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {course.prerequisites.map((p) => (
                  <Chip key={p.id} label={`${p.code} - ${p.name}`} />
                ))}
              </Stack>
              <Divider />
              <Typography variant="subtitle2" color="text.secondary">
                Ağaç
              </Typography>
              {renderPrerequisiteTree(course.prerequisiteTree)}
            </Stack>
          ) : (
            <Typography color="text.secondary">Ön koşul yok.</Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}

export default CourseDetailPage;
