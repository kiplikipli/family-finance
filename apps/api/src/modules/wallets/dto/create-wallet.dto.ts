import { IsString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WalletType } from '../entities/wallet.entity';

export class CreateWalletDto {
  @ApiProperty({ example: 'My Wallet' })
  @IsString()
  name: string;

  @ApiProperty({ enum: WalletType, example: WalletType.PRIVATE })
  @IsEnum(WalletType)
  type: WalletType;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  openingBalanceMinor?: number;

  @ApiPropertyOptional({ example: 'My primary wallet' })
  @IsOptional()
  @IsString()
  description?: string;
}
