export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  wallets: {
    all: ['wallets'] as const,
    detail: (id: string) => ['wallets', id] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    list: (filters: Record<string, unknown>) => ['transactions', 'list', filters] as const,
    detail: (id: string) => ['transactions', id] as const,
  },
  categories: {
    all: ['categories'] as const,
  },
  tags: {
    all: ['tags'] as const,
  },
  recurring: {
    all: ['recurring'] as const,
    detail: (id: string) => ['recurring', id] as const,
  },
  dashboard: {
    summary: (params: Record<string, unknown>) => ['dashboard', 'summary', params] as const,
    cashflow: (params: Record<string, unknown>) => ['dashboard', 'cashflow', params] as const,
    categories: (params: Record<string, unknown>) => ['dashboard', 'categories', params] as const,
    wallets: ['dashboard', 'wallets'] as const,
    recurring: ['dashboard', 'recurring'] as const,
    recent: (params: Record<string, unknown>) => ['dashboard', 'recent', params] as const,
  },
  users: {
    all: ['users'] as const,
  },
};
