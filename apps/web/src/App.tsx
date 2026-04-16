import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  Navigate,
} from '@tanstack/react-router';
import { useAuth } from './lib/auth';
import { AppLayout } from './components/layout/app-layout';
import { ErrorBoundary } from './components/layout/error-boundary';
import { LoginPage } from './pages/auth/login-page';
import { DashboardPage } from './pages/dashboard/dashboard-page';
import { WalletsPage } from './pages/wallets/wallets-page';
import { WalletDetailPage } from './pages/wallets/wallet-detail-page';
import { TransactionsPage } from './pages/transactions/transactions-page';
import { RecurringPage } from './pages/recurring/recurring-page';
import { SettingsPage } from './pages/settings/settings-page';
import { Skeleton } from './components/ui/skeleton';

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Auth route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

// Protected layout route
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  component: () => (
    <AppLayout>
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </AppLayout>
  ),
});

// Dashboard
const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/',
  component: DashboardPage,
});

// Wallets
const walletsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/wallets',
  component: WalletsPage,
});

const walletDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/wallets/$id',
  component: WalletDetailPage,
});

// Transactions
const transactionsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/transactions',
  component: TransactionsPage,
});

// Recurring
const recurringRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/recurring',
  component: RecurringPage,
});

// Settings
const settingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/settings',
  component: SettingsPage,
});

// Build route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    walletsRoute,
    walletDetailRoute,
    transactionsRoute,
    recurringRoute,
    settingsRoute,
  ]),
]);

// Create router
const router = createRouter({ routeTree });

// Register the router type
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated && window.location.pathname !== '/login') {
    window.location.href = '/login';
    return null;
  }

  if (isAuthenticated && window.location.pathname === '/login') {
    window.location.href = '/';
    return null;
  }

  return <RouterProvider router={router} />;
}
