import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useWallets, useCreateWallet } from '@/hooks/use-wallets';
import { formatCurrency } from '@family-finance/utils';

export function WalletsPage() {
  const { data: wallets, isLoading } = useWallets();
  const createWallet = useCreateWallet();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'PRIVATE' as 'PRIVATE' | 'SHARED',
    openingBalanceMinor: 0,
    description: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createWallet.mutateAsync(form);
    setShowCreate(false);
    setForm({ name: '', type: 'PRIVATE', openingBalanceMinor: 0, description: '' });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wallets</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Wallet
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {wallets?.map((wallet: any) => (
          <Link key={wallet.id} to="/wallets/$id" params={{ id: wallet.id }}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{wallet.name}</CardTitle>
                  <Badge variant={wallet.type === 'SHARED' ? 'default' : 'secondary'}>
                    {wallet.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(wallet.currentBalanceMinor)}
                </p>
                {wallet.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{wallet.description}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent onClose={() => setShowCreate(false)}>
          <DialogHeader>
            <DialogTitle>Create Wallet</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
              >
                <option value="PRIVATE">Private</option>
                <option value="SHARED">Shared</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Opening Balance (minor units)</Label>
              <Input
                type="number"
                value={form.openingBalanceMinor}
                onChange={(e) => setForm({ ...form, openingBalanceMinor: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createWallet.isPending}>
                {createWallet.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
