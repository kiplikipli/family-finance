import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { ShareWalletDto } from './dto/share-wallet.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Wallets')
@ApiBearerAuth()
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  @ApiOperation({ summary: 'List all accessible wallets' })
  async findAll(@CurrentUser() user: any) {
    return this.walletsService.findAllForUser(user.id, user.role);
  }

  @Post()
  @ApiOperation({ summary: 'Create a wallet' })
  async create(
    @Body() createWalletDto: CreateWalletDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.walletsService.create(createWalletDto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wallet details' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.walletsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a wallet' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWalletDto: UpdateWalletDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.walletsService.update(id, updateWalletDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a wallet' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.walletsService.softDelete(id, userId);
    return { message: 'Wallet deleted' };
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Share wallet with a user' })
  async share(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() shareWalletDto: ShareWalletDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.walletsService.shareWallet(id, shareWalletDto, userId);
  }

  @Delete(':id/share/:userId')
  @ApiOperation({ summary: 'Remove wallet share' })
  async removeShare(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.walletsService.removeShare(id, targetUserId, userId);
    return { message: 'Share removed' };
  }
}
