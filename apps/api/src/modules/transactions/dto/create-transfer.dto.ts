import { IsInt, IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTransferDto {
  @ApiProperty()
  @IsUUID()
  sourceWalletId: string;

  @ApiProperty()
  @IsUUID()
  destinationWalletId: string;

  @ApiProperty({ example: 100000 })
  @IsInt()
  amountMinor: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  transactionDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
