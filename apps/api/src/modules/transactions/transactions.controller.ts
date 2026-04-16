import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { CreateSplitDto } from './dto/create-split.dto';
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'List transactions with filters' })
  async findAll(
    @Query() filters: FilterTransactionsDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.transactionsService.findAll(filters, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a transaction' })
  async create(
    @Body() dto: CreateTransactionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.transactionsService.create(dto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a transaction' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.transactionsService.update(id, dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a transaction' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.transactionsService.softDelete(id, userId);
    return { message: 'Transaction deleted' };
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Create a transfer between wallets' })
  async createTransfer(
    @Body() dto: CreateTransferDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.transactionsService.createTransfer(dto, userId);
  }

  @Post('split')
  @ApiOperation({ summary: 'Create a split transaction' })
  async createSplit(
    @Body() dto: CreateSplitDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.transactionsService.createSplit(dto, userId);
  }
}
