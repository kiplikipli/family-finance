import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useTransactions, useCreateTransaction, useDeleteTransaction } from '@/hooks/use-transactions';
import { useWallets } from '@/hooks/use-wallets';
import { useCategories } from '@/hooks/use-categories';
import { formatCurrency } from '@family-finance/utils';

export function TransactionsPage() {
  const [filters, setFilters] = useState<Record<string, any>>({
    page: 1,
    limit: 20,
  });
  const { data: response, isLoading } = useTransactions(filters);
  const { data: wallets } = useWallets();
  const { data: categories } = useCategories();
  const createTransaction = useCreateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    walletId: '',
    type: 'EXPENSE' as string,
    amountMinor: 0,
    categoryId: '',
    transactionDate: new Date().toISOString().split('T')[0],
    note: '',
  });

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'transactionDate',
        header: 'Date',
        cell: ({ row }) => new Date(row.original.transactionDate).toLocaleDateString(),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.type === 'INCOME'
                ? 'default'
                : row.original.type === 'EXPENSE'
                ? 'destructive'
                : 'secondary'
            }
          >
            {row.original.type}
          </Badge>
        ),
      },
      {
        accessorKey: 'wallet.name',
        header: 'Wallet',
        cell: ({ row }) => row.original.wallet?.name || '-',
      },
      {
        accessorKey: 'category.name',
        header: 'Category',
        cell: ({ row }) => row.original.category?.name || '-',
      },
      {
        accessorKey: 'amountMinor',
        header: 'Amount',
        cell: ({ row }) => (
          <span className={row.original.type === 'INCOME' ? 'text-green-600' : row.original.type === 'EXPENSE' ? 'text-red-600' : ''}>
            {formatCurrency(row.original.amountMinor)}
          </span>
        ),
      },
      {
        accessorKey: 'note',
        header: 'Note',
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteTransaction.mutate(row.original.id)}
          >
            Delete
          </Button>
        ),
      },
    ],
    [deleteTransaction],
  );

  const table = useReactTable({
    data: response?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: response?.totalPages || 0,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTransaction.mutateAsync({
      ...form,
      categoryId: form.categoryId || undefined,
    });
    setShowCreate(false);
    setForm({
      walletId: '',
      type: 'EXPENSE',
      amountMinor: 0,
      categoryId: '',
      transactionDate: new Date().toISOString().split('T')[0],
      note: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Search..."
              value={filters.keyword || ''}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value, page: 1 })}
            />
            <Select
              value={filters.walletId || ''}
              onChange={(e) => setFilters({ ...filters, walletId: e.target.value || undefined, page: 1 })}
            >
              <option value="">All Wallets</option>
              {wallets?.map((w: any) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </Select>
            <Select
              value={filters.type || ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined, page: 1 })}
            >
              <option value="">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
              <option value="TRANSFER">Transfer</option>
              <option value="ADJUSTMENT">Adjustment</option>
            </Select>
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined, page: 1 })}
              />
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined, page: 1 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {response && response.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {response.page} of {response.totalPages} ({response.total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page <= 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page >= response.totalPages}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent onClose={() => setShowCreate(false)}>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Wallet</Label>
              <Select
                value={form.walletId}
                onChange={(e) => setForm({ ...form, walletId: e.target.value })}
                required
              >
                <option value="">Select wallet...</option>
                {wallets?.map((w: any) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
                <option value="ADJUSTMENT">Adjustment</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (minor units)</Label>
              <Input
                type="number"
                value={form.amountMinor}
                onChange={(e) => setForm({ ...form, amountMinor: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">No category</option>
                {categories?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={form.transactionDate}
                onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <Textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTransaction.isPending}>
                {createTransaction.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
