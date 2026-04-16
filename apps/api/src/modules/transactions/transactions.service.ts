import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction, TransactionGroup, TransactionType } from './entities/transaction.entity';
import { TransactionRevision } from './entities/transaction-revision.entity';
import { Tag } from '../tags/entities/tag.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateSplitDto } from './dto/create-split.dto';
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(TransactionGroup)
    private groupsRepository: Repository<TransactionGroup>,
    @InjectRepository(TransactionRevision)
    private revisionsRepository: Repository<TransactionRevision>,
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateTransactionDto, userId: string): Promise<Transaction> {
    const transaction = this.transactionsRepository.create({
      walletId: dto.walletId,
      type: dto.type,
      amountMinor: dto.amountMinor,
      categoryId: dto.categoryId || null,
      transactionDate: dto.transactionDate,
      note: dto.note || null,
      attachmentUrl: dto.attachmentUrl || null,
      createdBy: userId,
      updatedBy: userId,
    });

    if (dto.tagIds && dto.tagIds.length > 0) {
      const tags = await this.tagsRepository.findByIds(dto.tagIds);
      transaction.tags = tags;
    }

    const saved = await this.transactionsRepository.save(transaction);
    this.logger.log(`Transaction created: ${saved.id}`);
    return saved;
  }

  async update(id: string, dto: UpdateTransactionDto, userId: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      relations: ['tags'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.createdBy !== userId) {
      throw new ForbiddenException('Can only edit own transactions');
    }

    // Store revision
    await this.revisionsRepository.save({
      transactionId: id,
      previousDataJson: this.serializeTransaction(transaction),
      changedBy: userId,
    });

    // Update fields
    if (dto.amountMinor !== undefined) transaction.amountMinor = dto.amountMinor;
    if (dto.categoryId !== undefined) transaction.categoryId = dto.categoryId;
    if (dto.transactionDate !== undefined) transaction.transactionDate = new Date(dto.transactionDate);
    if (dto.note !== undefined) transaction.note = dto.note;
    if (dto.attachmentUrl !== undefined) transaction.attachmentUrl = dto.attachmentUrl;
    transaction.updatedBy = userId;

    if (dto.tagIds) {
      const tags = await this.tagsRepository.findByIds(dto.tagIds);
      transaction.tags = tags;
    }

    return this.transactionsRepository.save(transaction);
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    // Store revision before delete
    await this.revisionsRepository.save({
      transactionId: id,
      previousDataJson: this.serializeTransaction(transaction),
      changedBy: userId,
    });

    await this.transactionsRepository.softRemove(transaction);
    this.logger.log(`Transaction soft deleted: ${id}`);
  }

  async findAll(filters: FilterTransactionsDto, userId: string) {
    const qb = this.transactionsRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.category', 'category')
      .leftJoinAndSelect('t.wallet', 'wallet')
      .leftJoinAndSelect('t.tags', 'tags')
      .where('t.deleted_at IS NULL');

    if (filters.walletId) {
      qb.andWhere('t.wallet_id = :walletId', { walletId: filters.walletId });
    }

    if (filters.categoryId) {
      qb.andWhere('t.category_id = :categoryId', { categoryId: filters.categoryId });
    }

    if (filters.userId) {
      qb.andWhere('t.created_by = :userId', { userId: filters.userId });
    }

    if (filters.type) {
      qb.andWhere('t.type = :type', { type: filters.type });
    }

    if (filters.dateFrom) {
      qb.andWhere('t.transaction_date >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      qb.andWhere('t.transaction_date <= :dateTo', { dateTo: filters.dateTo });
    }

    if (filters.minAmount !== undefined) {
      qb.andWhere('t.amount_minor >= :minAmount', { minAmount: filters.minAmount });
    }

    if (filters.maxAmount !== undefined) {
      qb.andWhere('t.amount_minor <= :maxAmount', { maxAmount: filters.maxAmount });
    }

    if (filters.keyword) {
      qb.andWhere('(t.note ILIKE :keyword)', { keyword: `%${filters.keyword}%` });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    qb.orderBy('t.transaction_date', 'DESC')
      .addOrderBy('t.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async createTransfer(dto: CreateTransferDto, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const transferGroupId = uuidv4();

      // Debit from source
      const debit = manager.create(Transaction, {
        walletId: dto.sourceWalletId,
        type: TransactionType.TRANSFER,
        amountMinor: dto.amountMinor,
        sourceWalletId: dto.sourceWalletId,
        destinationWalletId: dto.destinationWalletId,
        transferGroupId,
        transactionDate: dto.transactionDate,
        note: dto.note || `Transfer to wallet`,
        createdBy: userId,
        updatedBy: userId,
      });

      // Credit to destination
      const credit = manager.create(Transaction, {
        walletId: dto.destinationWalletId,
        type: TransactionType.TRANSFER,
        amountMinor: dto.amountMinor,
        sourceWalletId: dto.sourceWalletId,
        destinationWalletId: dto.destinationWalletId,
        transferGroupId,
        transactionDate: dto.transactionDate,
        note: dto.note || `Transfer from wallet`,
        createdBy: userId,
        updatedBy: userId,
      });

      const [savedDebit, savedCredit] = await Promise.all([
        manager.save(Transaction, debit),
        manager.save(Transaction, credit),
      ]);

      this.logger.log(`Transfer created: ${transferGroupId}`);
      return { transferGroupId, debit: savedDebit, credit: savedCredit };
    });
  }

  async createSplit(dto: CreateSplitDto, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      // Create transaction group
      const group = manager.create(TransactionGroup, {
        title: dto.title,
        description: dto.description || null,
        createdBy: userId,
      });
      const savedGroup = await manager.save(TransactionGroup, group);

      // Create individual transactions
      const transactions = dto.items.map((item) =>
        manager.create(Transaction, {
          walletId: dto.walletId,
          transactionGroupId: savedGroup.id,
          type: dto.type,
          amountMinor: item.amountMinor,
          categoryId: item.categoryId || null,
          transactionDate: dto.transactionDate,
          note: item.note || null,
          createdBy: userId,
          updatedBy: userId,
        }),
      );

      const savedTransactions = await manager.save(Transaction, transactions);

      this.logger.log(`Split transaction created: ${savedGroup.id}`);
      return { group: savedGroup, transactions: savedTransactions };
    });
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
      relations: ['category', 'wallet', 'tags'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  private serializeTransaction(transaction: Transaction): Record<string, unknown> {
    const { tags, wallet, category, sourceWallet, destinationWallet, transactionGroup, ...data } = transaction;
    return data as unknown as Record<string, unknown>;
  }
}
