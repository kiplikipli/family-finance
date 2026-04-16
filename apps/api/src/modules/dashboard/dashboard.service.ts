import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { RecurringPayment } from '../recurring/entities/recurring-payment.entity';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
    @InjectRepository(RecurringPayment)
    private recurringRepository: Repository<RecurringPayment>,
  ) {}

  async getSummary(userId: string, query: DashboardQueryDto) {
    const { from, to } = this.getDateRange(query);

    const qb = this.transactionsRepository
      .createQueryBuilder('t')
      .select([
        "COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount_minor ELSE 0 END), 0) as \"totalIncome\"",
        "COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount_minor ELSE 0 END), 0) as \"totalExpenses\"",
      ])
      .where('t.deleted_at IS NULL')
      .andWhere('t.transaction_date >= :from', { from })
      .andWhere('t.transaction_date <= :to', { to });

    if (query.walletIds && query.walletIds.length > 0) {
      qb.andWhere('t.wallet_id IN (:...walletIds)', { walletIds: query.walletIds });
    }

    const result = await qb.getRawOne();

    const totalIncome = Number(result?.totalIncome || 0);
    const totalExpenses = Number(result?.totalExpenses || 0);

    return {
      totalIncome,
      totalExpenses,
      netCashflow: totalIncome - totalExpenses,
      from,
      to,
    };
  }

  async getCashflow(userId: string, query: DashboardQueryDto) {
    const { from, to } = this.getDateRange(query);

    const result = await this.transactionsRepository
      .createQueryBuilder('t')
      .select([
        't.transaction_date as date',
        "COALESCE(SUM(CASE WHEN t.type = 'INCOME' THEN t.amount_minor ELSE 0 END), 0) as income",
        "COALESCE(SUM(CASE WHEN t.type = 'EXPENSE' THEN t.amount_minor ELSE 0 END), 0) as expense",
      ])
      .where('t.deleted_at IS NULL')
      .andWhere('t.transaction_date >= :from', { from })
      .andWhere('t.transaction_date <= :to', { to })
      .groupBy('t.transaction_date')
      .orderBy('t.transaction_date', 'ASC')
      .getRawMany();

    return result.map((row) => ({
      date: row.date,
      income: Number(row.income),
      expense: Number(row.expense),
    }));
  }

  async getCategoryBreakdown(userId: string, query: DashboardQueryDto) {
    const { from, to } = this.getDateRange(query);

    return this.transactionsRepository
      .createQueryBuilder('t')
      .leftJoin('t.category', 'c')
      .select([
        'c.id as "categoryId"',
        'c.name as "categoryName"',
        'SUM(t.amount_minor) as total',
      ])
      .where('t.deleted_at IS NULL')
      .andWhere("t.type = 'EXPENSE'")
      .andWhere('t.transaction_date >= :from', { from })
      .andWhere('t.transaction_date <= :to', { to })
      .groupBy('c.id')
      .addGroupBy('c.name')
      .orderBy('total', 'DESC')
      .getRawMany();
  }

  async getWalletBalances(userId: string) {
    const wallets = await this.walletsRepository
      .createQueryBuilder('w')
      .leftJoin('w.shares', 's')
      .where('w.owner_user_id = :userId', { userId })
      .orWhere('s.user_id = :userId', { userId })
      .andWhere('w.deleted_at IS NULL')
      .getMany();

    const balances = await Promise.all(
      wallets.map(async (wallet) => {
        const result = await this.transactionsRepository
          .createQueryBuilder('t')
          .select(
            "COALESCE(SUM(CASE WHEN t.type IN ('INCOME', 'ADJUSTMENT') THEN t.amount_minor WHEN t.type = 'EXPENSE' THEN -t.amount_minor ELSE 0 END), 0)",
            'total',
          )
          .where('t.wallet_id = :walletId', { walletId: wallet.id })
          .andWhere('t.deleted_at IS NULL')
          .getRawOne();

        return {
          id: wallet.id,
          name: wallet.name,
          type: wallet.type,
          currentBalanceMinor:
            Number(wallet.openingBalanceMinor) + Number(result?.total || 0),
        };
      }),
    );

    return balances;
  }

  async getUpcomingRecurring(userId: string) {
    return this.recurringRepository.find({
      where: { createdBy: userId, active: true },
      relations: ['wallet', 'category'],
      order: { nextDueDate: 'ASC' },
      take: 10,
    });
  }

  async getRecentTransactions(userId: string, query: DashboardQueryDto) {
    const qb = this.transactionsRepository
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.category', 'c')
      .leftJoinAndSelect('t.wallet', 'w')
      .where('t.deleted_at IS NULL')
      .orderBy('t.transaction_date', 'DESC')
      .addOrderBy('t.created_at', 'DESC')
      .take(10);

    if (query.walletIds && query.walletIds.length > 0) {
      qb.andWhere('t.wallet_id IN (:...walletIds)', { walletIds: query.walletIds });
    }

    return qb.getMany();
  }

  private getDateRange(query: DashboardQueryDto) {
    const now = new Date();
    const from =
      query.from || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const to =
      query.to ||
      new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    return { from, to };
  }
}
