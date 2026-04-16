import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RecurringService } from '../recurring/recurring.service';
import { NotificationsService } from './notifications.service';
import { NotificationChannel } from './entities/notification.entity';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    private readonly recurringService: RecurringService,
    private readonly notificationsService: NotificationsService,
    @InjectQueue('notifications') private notificationsQueue: Queue,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkDueRecurring(): Promise<void> {
    this.logger.log('Checking due recurring payments...');

    const duePayments = await this.recurringService.findDue();

    for (const payment of duePayments) {
      if (!payment.reminderEnabled || !payment.createdBy) continue;

      // Check for duplicate notifications
      const existing = await this.notificationsService.findForUser(payment.createdBy);
      const alreadyNotified = existing.some(
        (n) =>
          n.type === 'RECURRING_DUE' &&
          (n.payloadJson as any)?.recurringId === payment.id &&
          new Date(n.createdAt).toDateString() === new Date().toDateString(),
      );

      if (alreadyNotified) continue;

      const notification = await this.notificationsService.enqueue(
        payment.createdBy,
        NotificationChannel.EMAIL,
        'RECURRING_DUE',
        {
          recurringId: payment.id,
          title: payment.title,
          amountMinor: payment.amountMinor,
          dueDate: payment.nextDueDate,
        },
      );

      await this.notificationsQueue.add('send-notification', {
        notificationId: notification.id,
        channel: notification.channel,
        payload: notification.payloadJson,
      });
    }
  }
}
