import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum WalletType {
  PRIVATE = 'PRIVATE',
  SHARED = 'SHARED',
}

@Entity('wallets')
export class Wallet extends BaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: WalletType,
    default: WalletType.PRIVATE,
  })
  type: WalletType;

  @Column({ name: 'owner_user_id', nullable: true })
  ownerUserId: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_user_id' })
  owner: User;

  @Column({ name: 'opening_balance_minor', type: 'bigint', default: 0 })
  openingBalanceMinor: number;

  @Column({ default: 'IDR' })
  currency: string;

  @Column({ nullable: true })
  description: string | null;

  @OneToMany(() => WalletShare, (share) => share.wallet)
  shares: WalletShare[];
}

export enum WalletPermission {
  VIEW = 'VIEW',
  CONTRIBUTE = 'CONTRIBUTE',
}

@Entity('wallet_shares')
export class WalletShare {
  @Column('uuid', { primary: true, default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ name: 'wallet_id' })
  walletId: string;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: WalletPermission,
    default: WalletPermission.VIEW,
  })
  permission: WalletPermission;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
