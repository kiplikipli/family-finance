export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
}

export interface ITransactionGroup {
  id: string;
  title: string;
  description: string | null;
  createdBy: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface ITransaction {
  id: string;
  walletId: string;
  transactionGroupId: string | null;
  type: TransactionType;
  amountMinor: number;
  categoryId: string | null;
  sourceWalletId: string | null;
  destinationWalletId: string | null;
  transferGroupId: string | null;
  transactionDate: string;
  note: string | null;
  attachmentUrl: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ITransactionRevision {
  id: string;
  transactionId: string;
  previousDataJson: Record<string, unknown>;
  changedBy: string | null;
  changedAt: string;
}
