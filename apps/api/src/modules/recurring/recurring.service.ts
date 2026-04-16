import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurringPayment, RecurrenceEndType } from './entities/recurring-payment.entity';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { UpdateRecurringDto } from './dto/update-recurring.dto';

@Injectable()
export class RecurringService {
  private readonly logger = new Logger(RecurringService.name);

  constructor(
    @InjectRepository(RecurringPayment)
    private recurringRepository: Repository<RecurringPayment>,
  ) {}

  async create(dto: CreateRecurringDto, userId: string): Promise<RecurringPayment> {
    const recurring = this.recurringRepository.create({
      title: dto.title,
      walletId: dto.walletId,
      categoryId: dto.categoryId || null,
      amountMinor: dto.amountMinor,
      recurrenceRule: dto.recurrenceRule,
      startDate: dto.startDate,
      nextDueDate: dto.startDate,
      endType: dto.endType || RecurrenceEndType.NEVER,
      endDate: dto.endDate || null,
      maxOccurrences: dto.maxOccurrences || null,
      reminderEnabled: dto.reminderEnabled !== false,
      createdBy: userId,
    });

    const saved = await this.recurringRepository.save(recurring);
    this.logger.log(`Recurring payment created: ${saved.title}`);
    return saved;
  }

  async findAll(userId: string): Promise<RecurringPayment[]> {
    return this.recurringRepository.find({
      where: { createdBy: userId },
      relations: ['wallet', 'category'],
      order: { nextDueDate: 'ASC' },
    });
  }

  async findOne(id: string): Promise<RecurringPayment> {
    const recurring = await this.recurringRepository.findOne({
      where: { id },
      relations: ['wallet', 'category'],
    });
    if (!recurring) {
      throw new NotFoundException('Recurring payment not found');
    }
    return recurring;
  }

  async update(id: string, dto: UpdateRecurringDto): Promise<RecurringPayment> {
    const recurring = await this.findOne(id);
    Object.assign(recurring, dto);
    return this.recurringRepository.save(recurring);
  }

  async softDelete(id: string): Promise<void> {
    const recurring = await this.findOne(id);
    await this.recurringRepository.softRemove(recurring);
  }

  async markPaid(id: string): Promise<{ prefilled: any; recurring: RecurringPayment }> {
    const recurring = await this.findOne(id);

    const prefilled = {
      walletId: recurring.walletId,
      categoryId: recurring.categoryId,
      amountMinor: recurring.amountMinor,
      transactionDate: recurring.nextDueDate,
      note: `Payment for: ${recurring.title}`,
      type: 'EXPENSE',
    };

    // Calculate next due date
    recurring.nextDueDate = this.calculateNextDueDate(recurring);
    await this.recurringRepository.save(recurring);

    return { prefilled, recurring };
  }

  async skip(id: string): Promise<RecurringPayment> {
    const recurring = await this.findOne(id);
    recurring.nextDueDate = this.calculateNextDueDate(recurring);
    return this.recurringRepository.save(recurring);
  }

  async findDue(): Promise<RecurringPayment[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.recurringRepository
      .createQueryBuilder('r')
      .where('r.active = true')
      .andWhere('r.next_due_date <= :today', { today: today.toISOString().split('T')[0] })
      .andWhere('r.deleted_at IS NULL')
      .getMany();
  }

  private calculateNextDueDate(recurring: RecurringPayment): Date {
    const current = new Date(recurring.nextDueDate);
    const rule = recurring.recurrenceRule.toLowerCase();

    switch (rule) {
      case 'daily':
        current.setDate(current.getDate() + 1);
        break;
      case 'weekly':
        current.setDate(current.getDate() + 7);
        break;
      case 'monthly':
        current.setMonth(current.getMonth() + 1);
        break;
      case 'yearly':
        current.setFullYear(current.getFullYear() + 1);
        break;
      default:
        // Custom cron - advance by 1 month as default
        current.setMonth(current.getMonth() + 1);
        break;
    }

    return current;
  }
}
