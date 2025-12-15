import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Alert from '../../components/feedback/Alert';
import { Transcript } from '../../types/academics';
import { downloadTranscriptPdf, extractData, getTranscript } from '../../services/gradeApi';
import { getErrorMessage } from '../../utils/error';

function TranscriptPage() {
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getTranscript();
        const data = extractData<Transcript>(response);
        setTranscript(data || null);
      } catch (err) {
        setError(getErrorMessage(err, 'Transkript yüklenemedi.'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      const response = await downloadTranscriptPdf();
      const blob = response.data as Blob;
      let filename = 'transcript.pdf';
      const disposition = response.headers?.['content-disposition'];
      if (disposition) {
        const match = /filename=([^;]+)/i.exec(disposition);
        if (match && match[1]) {
          filename = match[1].trim().replace(/"/g, '');
        }
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err, 'PDF indirilemedi.'));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Box py={4}>
        <LoadingSpinner label="Yükleniyor..." />
      </Box>
    );
  }

  if (error) {
    return <Alert variant="error" message={error} />;
  }

  const semesters = Array.isArray(transcript?.semesters) ? transcript?.semesters : [];

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={800}>
          Transkript
        </Typography>
        <Button variant="contained" onClick={handleDownload} disabled={downloading}>
          {downloading ? 'İndiriliyor...' : 'PDF indir'}
        </Button>
      </Stack>

      {transcript ? (
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              {transcript.student?.firstName} {transcript.student?.lastName} ({transcript.student?.studentNumber})
            </Typography>
            <Typography variant="body2" mb={2}>
              Bölüm: {transcript.student?.department || '-'} | Başlangıç: {transcript.student?.enrollmentYear || '-'}
            </Typography>
            <Stack spacing={2}>
              {semesters.map((sem, idx) => (
                <Card key={idx} variant="outlined">
                  <CardContent>
                    <Typography fontWeight={700}>
                      {sem.year} - {sem.semester.toUpperCase()} (GPA: {sem.gpa ?? '-'})
                    </Typography>
                    <Stack spacing={0.5} mt={1}>
                      {sem.courses.map((c, ci) => (
                        <Typography key={ci} variant="body2">
                          {c.code} - {c.name} | Kredi: {c.credits} | Not: {c.letterGrade ?? '-'}
                        </Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
            <Typography fontWeight={700} mt={2}>
              CGPA: {transcript.cgpa ?? '-'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Alert variant="error" message="Transkript bulunamadı." />
      )}
    </Stack>
  );
}

export default TranscriptPage;

