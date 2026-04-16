import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TagScope {
  GLOBAL = 'GLOBAL',
  PRIVATE = 'PRIVATE',
}

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: TagScope,
    default: TagScope.GLOBAL,
  })
  scope: TagScope;

  @Column({ name: 'owner_user_id', nullable: true })
  ownerUserId: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_user_id' })
  owner: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
