import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

export function useDashboardSummary(params: { from?: string; to?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(params),
    queryFn: async () => {
      const { data } = await api.get('/dashboard/summary', { params });
      return data;
    },
  });
}

export function useDashboardCashflow(params: { from?: string; to?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard.cashflow(params),
    queryFn: async () => {
      const { data } = await api.get('/dashboard/cashflow', { params });
      return data;
    },
  });
}

export function useDashboardCategories(params: { from?: string; to?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard.categories(params),
    queryFn: async () => {
      const { data } = await api.get('/dashboard/categories', { params });
      return data;
    },
  });
}

export function useDashboardWallets() {
  return useQuery({
    queryKey: queryKeys.dashboard.wallets,
    queryFn: async () => {
      const { data } = await api.get('/dashboard/wallets');
      return data;
    },
  });
}

export function useDashboardRecurring() {
  return useQuery({
    queryKey: queryKeys.dashboard.recurring,
    queryFn: async () => {
      const { data } = await api.get('/dashboard/recurring');
      return data;
    },
  });
}

export function useDashboardRecent(params: { from?: string; to?: string } = {}) {
  return useQuery({
    queryKey: queryKeys.dashboard.recent(params),
    queryFn: async () => {
      const { data } = await api.get('/dashboard/recent', { params });
      return data;
    },
  });
}
