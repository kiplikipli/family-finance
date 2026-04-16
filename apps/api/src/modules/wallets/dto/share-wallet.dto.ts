import { IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { WalletPermission } from '../entities/wallet.entity';

export class ShareWalletDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: WalletPermission, example: WalletPermission.VIEW })
  @IsEnum(WalletPermission)
  permission: WalletPermission;
}
