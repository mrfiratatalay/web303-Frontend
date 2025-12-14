import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import { verifyEmail } from '../../services/authApi';
import { getErrorMessage } from '../../utils/error';
import AuthLayout from '../../components/layout/AuthLayout';

type VerifyState = {
  loading: boolean;
  success: boolean;
  message: string;
};

function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerifyState>({ loading: true, success: false, message: '' });

  useEffect(() => {
    const handleVerify = async () => {
      try {
        const response = await verifyEmail(token || '');
        const message =
          (response as { data?: { data?: { message?: string } } })?.data?.data?.message ||
          'E-posta doğrulandı, birkaç saniye içinde giriş sayfasına yönlendirileceksiniz.';
        setStatus({
          loading: false,
          success: true,
          message,
        });
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setStatus({
          loading: false,
          success: false,
          message: getErrorMessage(err, 'Geçersiz veya süresi dolmuş doğrulama linki.'),
        });
      }
    };
    handleVerify();
  }, [navigate, token]);

  return (
    <AuthLayout title="E-posta Doğrulama" subtitle="Hesabınızı doğruluyoruz.">
      {status.loading ? (
        <div className="flex items-center justify-center py-6">
          <LoadingSpinner label="Doğrulanıyor..." />
        </div>
      ) : (
        <Alert variant={status.success ? 'success' : 'error'} message={status.message} />
      )}
    </AuthLayout>
  );
}

export default VerifyEmailPage;
