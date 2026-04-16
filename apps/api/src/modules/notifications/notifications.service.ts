import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationChannel,
  NotificationStatus,
} from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async enqueue(
    userId: string,
    channel: NotificationChannel,
    type: string,
    payload: Record<string, unknown>,
    scheduledAt?: Date,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      userId,
      channel,
      type,
      payloadJson: payload,
      status: NotificationStatus.PENDING,
      scheduledAt: scheduledAt || null,
    });

    const saved = await this.notificationsRepository.save(notification);
    this.logger.log(`Notification enqueued: ${saved.id} for user ${userId}`);
    return saved;
  }

  async findPending(): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { status: NotificationStatus.PENDING },
      order: { createdAt: 'ASC' },
      take: 50,
    });
  }

  async markSent(id: string): Promise<void> {
    await this.notificationsRepository.update(id, {
      status: NotificationStatus.SENT,
      sentAt: new Date(),
    });
  }

  async markFailed(id: string): Promise<void> {
    const notification = await this.notificationsRepository.findOne({ where: { id } });
    if (notification) {
      notification.status = NotificationStatus.FAILED;
      notification.retries = notification.retries + 1;
      await this.notificationsRepository.save(notification);
    }
  }

  async findForUser(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
