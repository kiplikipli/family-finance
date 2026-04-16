import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity('transaction_revisions')
export class TransactionRevision {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transaction_id' })
  transactionId: string;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @Column({ name: 'previous_data_json', type: 'jsonb' })
  previousDataJson: Record<string, unknown>;

  @Column({ name: 'changed_by', nullable: true })
  changedBy: string | null;

  @Column({ name: 'changed_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  changedAt: Date;
}
