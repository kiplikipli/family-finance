import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
export function useTransactions(filters = {}) {
    return useQuery({
        queryKey: queryKeys.transactions.list(filters),
        queryFn: async () => {
            const { data } = await api.get('/transactions', { params: filters });
            return data;
        },
    });
}
export function useTransaction(id) {
    return useQuery({
        queryKey: queryKeys.transactions.detail(id),
        queryFn: async () => {
            const { data } = await api.get(`/transactions/${id}`);
            return data;
        },
        enabled: !!id,
    });
}
export function useCreateTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (transaction) => {
            const { data } = await api.post('/transactions', transaction);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.wallets.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.wallets });
        },
    });
}
export function useUpdateTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...transaction }) => {
            const { data } = await api.patch(`/transactions/${id}`, transaction);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.wallets.all });
        },
    });
}
export function useDeleteTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await api.delete(`/transactions/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.wallets.all });
        },
    });
}
export function useCreateTransfer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (transfer) => {
            const { data } = await api.post('/transactions/transfer', transfer);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.wallets.all });
        },
    });
}
export function useCreateSplit() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (split) => {
            const { data } = await api.post('/transactions/split', split);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.wallets.all });
        },
    });
}
