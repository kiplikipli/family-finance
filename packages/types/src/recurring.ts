export enum RecurrenceEndType {
  NEVER = 'NEVER',
  ON_DATE = 'ON_DATE',
  AFTER_OCCURRENCES = 'AFTER_OCCURRENCES',
}

export enum RecurringStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SKIPPED = 'SKIPPED',
}

export interface IRecurringPayment {
  id: string;
  title: string;
  walletId: string;
  categoryId: string | null;
  amountMinor: number;
  recurrenceRule: string;
  startDate: string;
  nextDueDate: string;
  endType: RecurrenceEndType;
  endDate: string | null;
  maxOccurrences: number | null;
  active: boolean;
  reminderEnabled: boolean;
  createdBy: string | null;
  deletedAt: string | null;
}
