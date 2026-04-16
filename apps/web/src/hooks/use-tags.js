import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
export function useTags() {
    return useQuery({
        queryKey: queryKeys.tags.all,
        queryFn: async () => {
            const { data } = await api.get('/tags');
            return data;
        },
    });
}
export function useCreateTag() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (tag) => {
            const { data } = await api.post('/tags', tag);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
        },
    });
}
export function useDeleteTag() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            await api.delete(`/tags/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
        },
    });
}
