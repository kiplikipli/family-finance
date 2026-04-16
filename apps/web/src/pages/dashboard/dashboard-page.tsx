import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  useDashboardSummary,
  useDashboardCashflow,
  useDashboardCategories,
  useDashboardWallets,
  useDashboardRecurring,
  useDashboardRecent,
} from '@/hooks/use-dashboard';
import { formatCurrency } from '@family-finance/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

type DateRange = 'today' | 'week' | 'month' | 'year';

function getDateRange(range: DateRange) {
  const now = new Date();
  const to = now.toISOString().split('T')[0];
  let from: string;

  switch (range) {
    case 'today':
      from = to;
      break;
    case 'week': {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      from = weekAgo.toISOString().split('T')[0];
      break;
    }
    case 'month':
      from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      break;
    case 'year':
      from = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      break;
  }

  return { from, to };
}

export function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const params = useMemo(() => getDateRange(dateRange), [dateRange]);

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary(params);
  const { data: cashflow, isLoading: cashflowLoading } = useDashboardCashflow(params);
  const { data: categories } = useDashboardCategories(params);
  const { data: wallets } = useDashboardWallets();
  const { data: recurring } = useDashboardRecurring();
  const { data: recent } = useDashboardRecent(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as DateRange)}
          className="w-40"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary?.totalIncome || 0)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary?.totalExpenses || 0)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Cashflow</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className={`text-2xl font-bold ${(summary?.netCashflow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary?.netCashflow || 0)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cashflow</CardTitle>
          </CardHeader>
          <CardContent>
            {cashflowLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={cashflow || []}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="income" fill="#22c55e" name="Income" />
                  <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categories && categories.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="total"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ categoryName }) => categoryName || 'Uncategorized'}
                  >
                    {categories.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wallet Balances & Recurring */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wallets?.map((wallet: any) => (
                <div key={wallet.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{wallet.name}</p>
                    <Badge variant="secondary">{wallet.type}</Badge>
                  </div>
                  <p className="font-semibold">{formatCurrency(wallet.currentBalanceMinor)}</p>
                </div>
              )) || (
                <p className="text-muted-foreground">No wallets</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Recurring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recurring?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(item.nextDueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.amountMinor)}</p>
                </div>
              )) || (
                <p className="text-muted-foreground">No upcoming payments</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recent?.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <p className="font-medium">{tx.note || tx.type}</p>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>{tx.wallet?.name}</span>
                    {tx.category && <span>· {tx.category.name}</span>}
                    <span>· {new Date(tx.transactionDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className={`font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : tx.type === 'EXPENSE' ? 'text-red-600' : ''}`}>
                  {tx.type === 'EXPENSE' ? '-' : '+'}{formatCurrency(tx.amountMinor)}
                </p>
              </div>
            )) || (
              <p className="text-muted-foreground">No recent transactions</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
