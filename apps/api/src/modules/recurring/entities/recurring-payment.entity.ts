import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { Category } from '../../categories/entities/category.entity';

export enum RecurrenceEndType {
  NEVER = 'NEVER',
  ON_DATE = 'ON_DATE',
  AFTER_OCCURRENCES = 'AFTER_OCCURRENCES',
}

@Entity('recurring_payments')
export class RecurringPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ name: 'wallet_id' })
  walletId: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'amount_minor', type: 'bigint' })
  amountMinor: number;

  @Column({ name: 'recurrence_rule' })
  recurrenceRule: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'next_due_date', type: 'date' })
  nextDueDate: Date;

  @Column({
    name: 'end_type',
    type: 'enum',
    enum: RecurrenceEndType,
    default: RecurrenceEndType.NEVER,
  })
  endType: RecurrenceEndType;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ name: 'max_occurrences', nullable: true })
  maxOccurrences: number | null;

  @Column({ default: true })
  active: boolean;

  @Column({ name: 'reminder_enabled', default: true })
  reminderEnabled: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
