import { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { submitExcuse } from '../../services/attendanceApi';
import { getErrorMessage } from '../../utils/error';

function ExcuseSubmitPage() {
  const [sessionId, setSessionId] = useState('');
  const [reason, setReason] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await submitExcuse({ session_id: sessionId, reason, document: file });
      setMessage('Mazeret gönderildi.');
      setSessionId('');
      setReason('');
      setFile(null);
    } catch (err) {
      setError(getErrorMessage(err, 'Mazeret gönderilemedi.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Mazeret Bildirimi
      </Typography>
      {message && <Alert variant="success" message={message} />}
      {error && <Alert variant="error" message={error} />}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <TextField label="Session ID" value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
            <TextField
              label="Açıklama"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              multiline
              minRows={3}
            />
            <Button variant="outlined" component="label">
              Belge ekle (JPEG/PNG/PDF, 5MB)
              <input
                hidden
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </Button>
            {file && <Typography variant="body2">{file.name}</Typography>}
            <Box>
              <Button variant="contained" onClick={handleSubmit} disabled={loading || !sessionId || !reason}>
                {loading ? <LoadingSpinner label="Gönderiliyor..." /> : 'Gönder'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default ExcuseSubmitPage;
