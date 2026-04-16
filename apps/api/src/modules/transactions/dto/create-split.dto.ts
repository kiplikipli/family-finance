import { IsString, IsUUID, IsDateString, IsOptional, IsArray, ValidateNested, IsInt, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TransactionType } from '../entities/transaction.entity';

export class SplitItemDto {
  @ApiProperty({ example: 25000 })
  @IsInt()
  amountMinor: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateSplitDto {
  @ApiProperty()
  @IsUUID()
  walletId: string;

  @ApiProperty({ example: 'Grocery Shopping' })
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.EXPENSE })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  transactionDate: string;

  @ApiProperty({ type: [SplitItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SplitItemDto)
  items: SplitItemDto[];
}
