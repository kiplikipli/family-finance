import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
export function useUsers() {
    return useQuery({
        queryKey: queryKeys.users.all,
        queryFn: async () => {
            const { data } = await api.get('/users');
            return data;
        },
    });
}
export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (user) => {
            const { data } = await api.post('/users', user);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}
export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...user }) => {
            const { data } = await api.patch(`/users/${id}`, user);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}
export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await api.delete(`/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}
