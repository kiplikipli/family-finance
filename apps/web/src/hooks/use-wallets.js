import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
export function useWallets() {
    return useQuery({
        queryKey: queryKeys.wallets.all,
        queryFn: async () => {
            const { data } = await api.get('/wallets');
            return data;
        },
    });
}
export function useWallet(id) {
    return useQuery({
        queryKey: queryKeys.wallets.detail(id),
        queryFn: async () => {
            const { data } = await api.get(`/wallets/${id}`);
            return data;
        },
        enabled: !!id,
    });
}
export function useCreateWallet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (wallet) => {
            const { data } = await api.post('/wallets', wallet);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.wallets.all });
        },
    });
}
export function useUpdateWallet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...wallet }) => {
            const { data } = await api.patch(`/wallets/${id}`, wallet);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.wallets.all });
        },
    });
}
export function useDeleteWallet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await api.delete(`/wallets/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.wallets.all });
        },
    });
}
export function useShareWallet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ walletId, ...data }) => {
            const { data: result } = await api.post(`/wallets/${walletId}/share`, data);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.wallets.all });
        },
    });
}
