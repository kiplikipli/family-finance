export const queryKeys = {
    auth: {
        me: ['auth', 'me'],
    },
    wallets: {
        all: ['wallets'],
        detail: (id) => ['wallets', id],
    },
    transactions: {
        all: ['transactions'],
        list: (filters) => ['transactions', 'list', filters],
        detail: (id) => ['transactions', id],
    },
    categories: {
        all: ['categories'],
    },
    tags: {
        all: ['tags'],
    },
    recurring: {
        all: ['recurring'],
        detail: (id) => ['recurring', id],
    },
    dashboard: {
        summary: (params) => ['dashboard', 'summary', params],
        cashflow: (params) => ['dashboard', 'cashflow', params],
        categories: (params) => ['dashboard', 'categories', params],
        wallets: ['dashboard', 'wallets'],
        recurring: ['dashboard', 'recurring'],
        recent: (params) => ['dashboard', 'recent', params],
    },
    users: {
        all: ['users'],
    },
};
