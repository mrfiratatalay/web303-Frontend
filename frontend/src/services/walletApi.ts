import { AxiosResponse } from 'axios';
import apiClient from './apiClient';
import {
  WalletBalance,
  WalletTopUpPayload,
  WalletTopUpResult,
  WalletTransaction,
} from '../types/wallet';

const unwrap = <T>(response: AxiosResponse<{ data: T }> | { data?: T } | T): T =>
  (response as AxiosResponse<{ data: T }>)?.data?.data ??
  (response as AxiosResponse<T>)?.data ??
  (response as T);

export const getWalletBalance = () => apiClient.get<WalletBalance>('/wallet/balance');

export const topUpWallet = (payload: WalletTopUpPayload) =>
  apiClient.post<WalletTopUpResult | WalletBalance>('/wallet/topup', payload);

export const getWalletTransactions = (params?: { limit?: number; page?: number }) =>
  apiClient.get<WalletTransaction[]>('/wallet/transactions', { params });

export const extractData = unwrap;
