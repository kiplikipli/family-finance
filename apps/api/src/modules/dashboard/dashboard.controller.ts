import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get income/expense summary' })
  async getSummary(
    @CurrentUser('id') userId: string,
    @Query() query: DashboardQueryDto,
  ) {
    return this.dashboardService.getSummary(userId, query);
  }

  @Get('cashflow')
  @ApiOperation({ summary: 'Get cashflow over time' })
  async getCashflow(
    @CurrentUser('id') userId: string,
    @Query() query: DashboardQueryDto,
  ) {
    return this.dashboardService.getCashflow(userId, query);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get category spending breakdown' })
  async getCategories(
    @CurrentUser('id') userId: string,
    @Query() query: DashboardQueryDto,
  ) {
    return this.dashboardService.getCategoryBreakdown(userId, query);
  }

  @Get('wallets')
  @ApiOperation({ summary: 'Get wallet balances' })
  async getWallets(@CurrentUser('id') userId: string) {
    return this.dashboardService.getWalletBalances(userId);
  }

  @Get('recurring')
  @ApiOperation({ summary: 'Get upcoming recurring payments' })
  async getRecurring(@CurrentUser('id') userId: string) {
    return this.dashboardService.getUpcomingRecurring(userId);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent transactions' })
  async getRecent(
    @CurrentUser('id') userId: string,
    @Query() query: DashboardQueryDto,
  ) {
    return this.dashboardService.getRecentTransactions(userId, query);
  }
}
