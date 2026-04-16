import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Plus, Check, SkipForward } from 'lucide-react';
import {
  useRecurring,
  useCreateRecurring,
  usePayRecurring,
  useSkipRecurring,
} from '@/hooks/use-recurring';
import { useWallets } from '@/hooks/use-wallets';
import { useCategories } from '@/hooks/use-categories';
import { formatCurrency } from '@family-finance/utils';

export function RecurringPage() {
  const { data: recurring, isLoading } = useRecurring();
  const { data: wallets } = useWallets();
  const { data: categories } = useCategories();
  const createRecurring = useCreateRecurring();
  const payRecurring = usePayRecurring();
  const skipRecurring = useSkipRecurring();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    walletId: '',
    categoryId: '',
    amountMinor: 0,
    recurrenceRule: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRecurring.mutateAsync({
      ...form,
      categoryId: form.categoryId || undefined,
    });
    setShowCreate(false);
    setForm({
      title: '',
      walletId: '',
      categoryId: '',
      amountMinor: 0,
      recurrenceRule: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
    });
  };

  const isDue = (dueDate: string) => new Date(dueDate) <= new Date();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Recurring Payments</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Schedule
        </Button>
      </div>

      <div className="space-y-4">
        {recurring?.map((item: any) => (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{item.title}</p>
                  {isDue(item.nextDueDate) && (
                    <Badge variant="destructive">Due</Badge>
                  )}
                  {!item.active && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.recurrenceRule} · Next: {new Date(item.nextDueDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.wallet?.name} {item.category ? `· ${item.category.name}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-xl font-bold">{formatCurrency(item.amountMinor)}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => payRecurring.mutate(item.id)}
                    disabled={payRecurring.isPending}
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Pay
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => skipRecurring.mutate(item.id)}
                    disabled={skipRecurring.isPending}
                  >
                    <SkipForward className="mr-1 h-3 w-3" />
                    Skip
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!recurring || recurring.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No recurring payments. Create one to get started.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent onClose={() => setShowCreate(false)}>
          <DialogHeader>
            <DialogTitle>Add Recurring Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="e.g. Internet Bill"
              />
            </div>
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
              <Label>Category</Label>
              <Select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">No category</option>
                {categories?.filter((c: any) => c.type === 'EXPENSE').map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
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
              <Label>Recurrence</Label>
              <Select
                value={form.recurrenceRule}
                onChange={(e) => setForm({ ...form, recurrenceRule: e.target.value })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createRecurring.isPending}>
                {createRecurring.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
