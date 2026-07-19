import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { AiGeneration, AiKind } from "@vlog/shared";

export function useAiGenerations() {
  return useQuery({
    queryKey: ["ai", "generations"],
    queryFn: () => api.raw<{ data: AiGeneration[] }>("/ai/generations").then((r) => r.data),
  });
}

export function useAiGenerate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ kind, context, postId }: { kind: AiKind; context: string; postId?: string }) =>
      api
        .raw<{ data: AiGeneration }>("/ai/generate", {
          method: "POST",
          body: JSON.stringify({ kind, context, postId }),
        })
        .then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ai", "generations"] }),
  });
}
