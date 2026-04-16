import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum CategoryScope {
  GLOBAL = 'GLOBAL',
  PRIVATE = 'PRIVATE',
}

@Entity('categories')
export class Category extends BaseEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: CategoryType,
  })
  type: CategoryType;

  @Column({
    type: 'enum',
    enum: CategoryScope,
    default: CategoryScope.GLOBAL,
  })
  scope: CategoryScope;

  @Column({ name: 'owner_user_id', nullable: true })
  ownerUserId: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_user_id' })
  owner: User;
}
