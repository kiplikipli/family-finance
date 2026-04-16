import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { RecurringPayment } from '../recurring/entities/recurring-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Wallet, RecurringPayment])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
