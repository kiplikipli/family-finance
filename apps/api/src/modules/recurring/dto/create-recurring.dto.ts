import { IsString, IsOptional, IsInt, IsUUID, IsDateString, IsEnum, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RecurrenceEndType } from '../entities/recurring-payment.entity';

export class CreateRecurringDto {
  @ApiProperty({ example: 'Internet Bill' })
  @IsString()
  title: string;

  @ApiProperty()
  @IsUUID()
  walletId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ example: 500000 })
  @IsInt()
  @Min(1)
  amountMinor: number;

  @ApiProperty({ example: 'monthly', description: 'daily, weekly, monthly, yearly, or cron expression' })
  @IsString()
  recurrenceRule: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ enum: RecurrenceEndType, default: RecurrenceEndType.NEVER })
  @IsOptional()
  @IsEnum(RecurrenceEndType)
  endType?: RecurrenceEndType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  maxOccurrences?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;
}
