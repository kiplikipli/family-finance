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
import { RecurringService } from './recurring.service';
import { CreateRecurringDto } from './dto/create-recurring.dto';
import { UpdateRecurringDto } from './dto/update-recurring.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Recurring Payments')
@ApiBearerAuth()
@Controller('recurring')
export class RecurringController {
  constructor(private readonly recurringService: RecurringService) {}

  @Get()
  @ApiOperation({ summary: 'List recurring payments' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.recurringService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a recurring payment' })
  async create(
    @Body() dto: CreateRecurringDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.recurringService.create(dto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a recurring payment' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.recurringService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recurring payment' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRecurringDto,
  ) {
    return this.recurringService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a recurring payment' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.recurringService.softDelete(id);
    return { message: 'Recurring payment deleted' };
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Mark recurring payment as paid' })
  async pay(@Param('id', ParseUUIDPipe) id: string) {
    return this.recurringService.markPaid(id);
  }

  @Post(':id/skip')
  @ApiOperation({ summary: 'Skip a recurring payment' })
  async skip(@Param('id', ParseUUIDPipe) id: string) {
    return this.recurringService.skip(id);
  }
}
