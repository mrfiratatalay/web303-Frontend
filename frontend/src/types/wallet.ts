export type WalletBalance = {
  balance: number;
  currency?: string;
  updated_at?: string;
};

export type WalletTransaction = {
  id: string;
  amount: number;
  type?: string;
  description?: string | null;
  status?: string | null;
  created_at?: string;
  createdAt?: string;
  balance_after?: number;
};

export type WalletTopUpPayload = {
  amount: number;
  method?: string;
  reference?: string;
};

export type WalletTopUpResult = {
  balance?: number;
  transaction?: WalletTransaction;
  message?: string;
};
