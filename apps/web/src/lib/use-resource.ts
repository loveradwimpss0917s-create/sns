import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

/**
 * Generic list/create/update/delete hook factory for a REST resource backed
 * by @vlog/workers' crudRoutes(). Each feature calls this once per entity
 * instead of hand-rolling react-query boilerplate.
 */
export function useResource<T extends { id: string }>(resource: string) {
  const queryClient = useQueryClient();
  const key = [resource];

  const list = useQuery({
    queryKey: key,
    queryFn: () => api.list<T>(resource),
  });

  const create = useMutation({
    mutationFn: (body: Partial<T>) => api.create<T>(resource, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      toast.success("保存しました");
    },
    onError: (err) => toast.error(`保存に失敗しました: ${(err as Error).message}`),
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<T> }) =>
      api.update<T>(resource, id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      toast.success("更新しました");
    },
    onError: (err) => toast.error(`更新に失敗しました: ${(err as Error).message}`),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.remove(resource, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      toast.success("削除しました");
    },
    onError: (err) => toast.error(`削除に失敗しました: ${(err as Error).message}`),
  });

  return { list, create, update, remove };
}
