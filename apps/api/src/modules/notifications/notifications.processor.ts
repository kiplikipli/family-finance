import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NotificationsService } from './notifications.service';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(private readonly notificationsService: NotificationsService) {
    super();
  }

  async process(job: Job): Promise<void> {
    const { notificationId, channel, payload } = job.data;

    try {
      this.logger.log(`Processing notification ${notificationId} via ${channel}`);

      // Future: route to appropriate channel handler
      // For now, just log and mark as sent
      switch (channel) {
        case 'EMAIL':
          this.logger.log(`Would send email: ${JSON.stringify(payload)}`);
          break;
        case 'TELEGRAM':
          this.logger.log(`Would send telegram: ${JSON.stringify(payload)}`);
          break;
        case 'WHATSAPP':
          this.logger.log(`Would send whatsapp: ${JSON.stringify(payload)}`);
          break;
        default:
          this.logger.warn(`Unknown channel: ${channel}`);
      }

      await this.notificationsService.markSent(notificationId);
    } catch (error) {
      this.logger.error(`Failed to process notification ${notificationId}`, error);
      await this.notificationsService.markFailed(notificationId);
      throw error;
    }
  }
}
