import { AxiosError } from 'axios';

type ApiErrorShape = {
  error?: { message?: string };
  message?: string;
};

export const getErrorMessage = (
  error: unknown,
  fallback = 'Beklenmeyen bir hata oluştu',
): string => {
  const axiosError = error as AxiosError<ApiErrorShape>;
  return (
    axiosError?.response?.data?.error?.message ||
    axiosError?.response?.data?.message ||
    (axiosError?.message as string) ||
    fallback
  );
};
