import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecurringService } from './recurring.service';
import { RecurringController } from './recurring.controller';
import { RecurringPayment } from './entities/recurring-payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecurringPayment])],
  controllers: [RecurringController],
  providers: [RecurringService],
  exports: [RecurringService],
})
export class RecurringModule {}
