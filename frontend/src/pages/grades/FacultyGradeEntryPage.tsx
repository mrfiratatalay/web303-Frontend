import { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { enterGrade } from '../../services/gradeApi';
import { getErrorMessage } from '../../utils/error';

function FacultyGradeEntryPage() {
  const [enrollmentId, setEnrollmentId] = useState('');
  const [midterm, setMidterm] = useState<string>('');
  const [finalGrade, setFinalGrade] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await enterGrade({
        enrollment_id: enrollmentId,
        midterm_grade: midterm === '' ? null : Number(midterm),
        final_grade: finalGrade === '' ? null : Number(finalGrade),
      });
      setMessage('Not girildi.');
    } catch (err) {
      setError(getErrorMessage(err, 'Not girilemedi.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Not Girişi
      </Typography>
      {message && <Alert variant="success" message={message} />}
      {error && <Alert variant="error" message={error} />}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <TextField label="Enrollment ID" value={enrollmentId} onChange={(e) => setEnrollmentId(e.target.value)} />
            <TextField
              label="Vize (0-100)"
              value={midterm}
              onChange={(e) => setMidterm(e.target.value)}
              type="number"
            />
            <TextField
              label="Final (0-100)"
              value={finalGrade}
              onChange={(e) => setFinalGrade(e.target.value)}
              type="number"
            />
            <Box>
              <Button variant="contained" onClick={handleSubmit} disabled={loading || !enrollmentId}>
                {loading ? <LoadingSpinner label="Kaydediliyor..." /> : 'Kaydet'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default FacultyGradeEntryPage;
