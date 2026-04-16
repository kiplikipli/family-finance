import { useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useWallet } from '@/hooks/use-wallets';
import { formatCurrency } from '@family-finance/utils';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function WalletDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { data: wallet, isLoading } = useWallet(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!wallet) {
    return <div className="text-center text-muted-foreground">Wallet not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/wallets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{wallet.name}</h1>
          <Badge variant={wallet.type === 'SHARED' ? 'default' : 'secondary'}>
            {wallet.type}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(wallet.currentBalanceMinor)}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Opening balance: {formatCurrency(wallet.openingBalanceMinor)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Currency</p>
              <p className="font-medium">{wallet.currency}</p>
            </div>
            {wallet.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{wallet.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {wallet.shares && wallet.shares.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Shared With</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {wallet.shares.map((share: any) => (
                <div key={share.id} className="flex items-center justify-between">
                  <p className="font-medium">{share.user?.name || share.userId}</p>
                  <Badge variant="outline">{share.permission}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
