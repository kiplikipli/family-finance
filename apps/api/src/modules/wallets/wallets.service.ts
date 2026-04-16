import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, WalletShare, WalletPermission, WalletType } from './entities/wallet.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { ShareWalletDto } from './dto/share-wallet.dto';

@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);

  constructor(
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
    @InjectRepository(WalletShare)
    private walletSharesRepository: Repository<WalletShare>,
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async create(createWalletDto: CreateWalletDto, userId: string): Promise<Wallet> {
    const wallet = this.walletsRepository.create({
      ...createWalletDto,
      ownerUserId: userId,
      currency: 'IDR',
      createdBy: userId,
      updatedBy: userId,
    });

    const saved = await this.walletsRepository.save(wallet);
    this.logger.log(`Wallet created: ${saved.name} by ${userId}`);
    return saved;
  }

  async findAllForUser(userId: string, userRole: string): Promise<any[]> {
    const queryBuilder = this.walletsRepository.createQueryBuilder('wallet');

    if (userRole === 'ADMIN') {
      // Admin sees shared wallets they have access to + their own
      queryBuilder.leftJoin('wallet.shares', 'share')
        .where('wallet.ownerUserId = :userId', { userId })
        .orWhere('share.userId = :userId', { userId });
    } else {
      // Regular user: own wallets + shared wallets
      queryBuilder.leftJoin('wallet.shares', 'share')
        .where('wallet.ownerUserId = :userId', { userId })
        .orWhere('share.userId = :userId', { userId });
    }

    const wallets = await queryBuilder.getMany();

    // Calculate balances
    const walletsWithBalance = await Promise.all(
      wallets.map(async (wallet) => {
        const balance = await this.calculateBalance(wallet.id);
        return { ...wallet, currentBalanceMinor: balance };
      }),
    );

    return walletsWithBalance;
  }

  async findOne(id: string, userId: string): Promise<any> {
    const wallet = await this.walletsRepository.findOne({
      where: { id },
      relations: ['shares', 'shares.user'],
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    this.checkWalletAccess(wallet, userId);

    const balance = await this.calculateBalance(id);
    return { ...wallet, currentBalanceMinor: balance };
  }

  async update(id: string, updateWalletDto: UpdateWalletDto, userId: string): Promise<Wallet> {
    const wallet = await this.walletsRepository.findOne({ where: { id } });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.ownerUserId !== userId) {
      throw new ForbiddenException('Only wallet owner can update');
    }

    Object.assign(wallet, updateWalletDto);
    wallet.updatedBy = userId;
    return this.walletsRepository.save(wallet);
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const wallet = await this.walletsRepository.findOne({ where: { id } });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.ownerUserId !== userId) {
      throw new ForbiddenException('Only wallet owner can delete');
    }

    await this.walletsRepository.softRemove(wallet);
    this.logger.log(`Wallet soft deleted: ${wallet.name}`);
  }

  async shareWallet(walletId: string, shareDto: ShareWalletDto, userId: string): Promise<WalletShare> {
    const wallet = await this.walletsRepository.findOne({ where: { id: walletId } });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.ownerUserId !== userId) {
      throw new ForbiddenException('Only wallet owner can share');
    }

    const existing = await this.walletSharesRepository.findOne({
      where: { walletId, userId: shareDto.userId },
    });

    if (existing) {
      existing.permission = shareDto.permission;
      return this.walletSharesRepository.save(existing);
    }

    const share = this.walletSharesRepository.create({
      walletId,
      userId: shareDto.userId,
      permission: shareDto.permission,
    });

    return this.walletSharesRepository.save(share);
  }

  async removeShare(walletId: string, targetUserId: string, userId: string): Promise<void> {
    const wallet = await this.walletsRepository.findOne({ where: { id: walletId } });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.ownerUserId !== userId) {
      throw new ForbiddenException('Only wallet owner can remove shares');
    }

    await this.walletSharesRepository.delete({
      walletId,
      userId: targetUserId,
    });
  }

  async calculateBalance(walletId: string): Promise<number> {
    const wallet = await this.walletsRepository.findOne({ where: { id: walletId } });
    if (!wallet) return 0;

    const result = await this.transactionsRepository
      .createQueryBuilder('t')
      .select('COALESCE(SUM(CASE WHEN t.type IN (\'INCOME\', \'ADJUSTMENT\') THEN t.amount_minor WHEN t.type = \'EXPENSE\' THEN -t.amount_minor WHEN t.type = \'TRANSFER\' AND t.destination_wallet_id = :walletId THEN t.amount_minor WHEN t.type = \'TRANSFER\' AND t.source_wallet_id = :walletId THEN -t.amount_minor ELSE 0 END), 0)', 'total')
      .where('t.wallet_id = :walletId', { walletId })
      .andWhere('t.deleted_at IS NULL')
      .getRawOne();

    return Number(wallet.openingBalanceMinor) + Number(result?.total || 0);
  }

  private checkWalletAccess(wallet: Wallet, userId: string): void {
    if (wallet.ownerUserId === userId) return;

    const hasShare = wallet.shares?.some((share) => share.userId === userId);
    if (!hasShare) {
      throw new ForbiddenException('No access to this wallet');
    }
  }
}
