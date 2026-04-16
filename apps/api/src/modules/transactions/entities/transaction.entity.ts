import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { Category } from '../../categories/entities/category.entity';
import { Tag } from '../../tags/entities/tag.entity';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
}

@Entity('transaction_groups')
export class TransactionGroup {
  @Column('uuid', { primary: true, default: () => 'gen_random_uuid()' })
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string | null;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}

@Entity('transactions')
export class Transaction extends BaseEntity {
  @Column({ name: 'wallet_id' })
  walletId: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column({ name: 'transaction_group_id', nullable: true })
  transactionGroupId: string | null;

  @ManyToOne(() => TransactionGroup)
  @JoinColumn({ name: 'transaction_group_id' })
  transactionGroup: TransactionGroup;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ name: 'amount_minor', type: 'bigint' })
  amountMinor: number;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'source_wallet_id', nullable: true })
  sourceWalletId: string | null;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'source_wallet_id' })
  sourceWallet: Wallet;

  @Column({ name: 'destination_wallet_id', nullable: true })
  destinationWalletId: string | null;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'destination_wallet_id' })
  destinationWallet: Wallet;

  @Column({ name: 'transfer_group_id', nullable: true })
  transferGroupId: string | null;

  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: Date;

  @Column({ nullable: true })
  note: string | null;

  @Column({ name: 'attachment_url', nullable: true })
  attachmentUrl: string | null;

  @ManyToMany(() => Tag)
  @JoinTable({
    name: 'transaction_tags',
    joinColumn: { name: 'transaction_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];
}
