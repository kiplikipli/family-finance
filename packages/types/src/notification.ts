export enum NotificationChannel {
  EMAIL = 'EMAIL',
  TELEGRAM = 'TELEGRAM',
  WHATSAPP = 'WHATSAPP',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

export interface INotification {
  id: string;
  userId: string;
  channel: NotificationChannel;
  type: string;
  payloadJson: Record<string, unknown>;
  status: NotificationStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  retries: number;
  createdAt: string;
}
