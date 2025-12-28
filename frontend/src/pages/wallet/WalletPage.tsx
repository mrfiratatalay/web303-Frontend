import { FormEvent, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Alert from '../../components/feedback/Alert';
import LoadingSpinner from '../../components/feedback/LoadingSpinner';
import Toast from '../../components/feedback/Toast';
import {
  extractData,
  getWalletBalance,
  getWalletTransactions,
  topUpWallet,
} from '../../services/walletApi';
import { WalletBalance, WalletTransaction } from '../../types/wallet';
import { getErrorMessage } from '../../utils/error';

const formatMoney = (value?: number | string | null) => {
  if (value === undefined || value === null) return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '-' : num.toFixed(2);
};

function WalletPage() {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [topupAmount, setTopupAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  const loadBalance = async () => {
    setLoadingBalance(true);
    try {
      const response = await getWalletBalance();
      const data = extractData<WalletBalance>(response);
      setBalance(data || null);
    } catch (err) {
      setError(getErrorMessage(err, 'Cüzdan bakiyesi yüklenemedi.'));
      setBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  };

  const loadTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const response = await getWalletTransactions();
      // Backend returns { data: { transactions: [...], total, page, limit} }
      // or { success: true, transactions: [...] }
      const rawData = extractData<{ transactions?: WalletTransaction[] } | WalletTransaction[]>(response);
      let txns: WalletTransaction[] = [];
      if (rawData && typeof rawData === 'object' && 'transactions' in rawData && Array.isArray(rawData.transactions)) {
        txns = rawData.transactions;
      } else if (Array.isArray(rawData)) {
        txns = rawData;
      }
      setTransactions(txns);
    } catch (err) {
      setError(getErrorMessage(err, 'Cüzdan işlemleri yüklenemedi.'));
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    loadBalance();
    loadTransactions();
  }, []);

  const handleTopupSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const amountValue = Number(topupAmount);
    if (!amountValue || amountValue <= 0) {
      setError('Gecerli bir yukleme tutari girin.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const response = await topUpWallet({ amount: amountValue });
      const data = extractData<WalletBalance | { balance?: number } | null>(response);
      if (data && typeof data === 'object' && 'balance' in data && data.balance !== undefined) {
        setBalance({ balance: data.balance, currency: balance?.currency });
      } else {
        await loadBalance();
      }
      await loadTransactions();
      setTopupAmount('');
      setToast({ open: true, type: 'success', message: 'Yükleme başarılı.' });
    } catch (err) {
      const message = getErrorMessage(err, 'Yükleme başarısız.');
      setError(message);
      setToast({ open: true, type: 'error', message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseToast = () => setToast((prev) => ({ ...prev, open: false }));

  const balanceLabel = balance
    ? `${formatMoney(balance.balance)}${balance.currency ? ` ${balance.currency}` : ''}`
    : '-';

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>
        Cuzdan
      </Typography>

      {error && <Alert variant="error" message={error} />}
      <Toast open={toast.open} onClose={handleCloseToast} type={toast.type} message={toast.message} />

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={700}>
              Bakiye
            </Typography>
            {loadingBalance ? (
              <Box py={2}>
                <LoadingSpinner label="Bakiye yükleniyor..." />
              </Box>
            ) : (
              <Typography variant="h4" fontWeight={800}>
                {balanceLabel}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2} component="form" onSubmit={handleTopupSubmit}>
            <Typography variant="subtitle1" fontWeight={700}>
              Para yukle
            </Typography>
            <TextField
              label="Tutar"
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              type="number"
              inputProps={{ min: 0, step: '0.01' }}
              placeholder="Tutar girin"
            />
            <Box>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || !Number(topupAmount)}
              >
                {submitting ? <LoadingSpinner label="Isleniyor..." /> : 'Yukle'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={700}>
              İşlemler
            </Typography>
            {loadingTransactions ? (
              <Box py={2}>
                <LoadingSpinner label="İşlemler yükleniyor..." />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tarih</TableCell>
                      <TableCell>Tip</TableCell>
                      <TableCell>Açıklama</TableCell>
                      <TableCell align="right">Tutar</TableCell>
                      <TableCell align="right">Bakiye</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell>
                          {(txn.created_at || txn.createdAt)
                            ? new Date(txn.created_at || txn.createdAt || '').toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {txn.type === 'credit' ? 'Yükleme' : txn.type === 'debit' ? 'Harcama' : txn.type || '-'}
                        </TableCell>
                        <TableCell>{txn.description || '-'}</TableCell>
                        <TableCell align="right">{formatMoney(txn.amount)}</TableCell>
                        <TableCell align="right">{formatMoney(txn.balance_after)}</TableCell>
                      </TableRow>
                    ))}
                    {!transactions.length && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary">İşlem bulunamadı.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default WalletPage;

