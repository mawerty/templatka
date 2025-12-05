import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, buildQueryString } from "./fetcher";

export type Cat = {
  id: number;
  name: string;
  breed: string;
  created_at: number;
  updated_at: number;
  is_cute: boolean;
  avatar_url: string | null;
};

export type CatCreate = {
  name: string;
  breed?: string;
};

export type CatUpdate = {
  name?: string;
  breed?: string;
  is_cute?: boolean;
  avatar_url?: string | null;
};

export const catKeys = {
  all: ["cats"] as const,
  lists: () => [...catKeys.all, "list"] as const,
  list: (params: { skip?: number; limit?: number }) => [...catKeys.lists(), params] as const,
  details: () => [...catKeys.all, "detail"] as const,
  detail: (id: number) => [...catKeys.details(), id] as const,
};

export function useCats(params: { skip?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: catKeys.list(params),
    queryFn: () => apiFetch<Cat[]>({ url: `/api/cats${buildQueryString(params)}` }),
  });
}

export function useCat(catId: number) {
  return useQuery({
    queryKey: catKeys.detail(catId),
    queryFn: () => apiFetch<Cat>({ url: `/api/cats/${catId}` }),
    enabled: !!catId,
  });
}

export function useCreateCat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CatCreate) => apiFetch<Cat, CatCreate>({ url: "/api/cats", method: "POST", body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: catKeys.lists() }),
  });
}

export function useUpdateCat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ catId, data }: { catId: number; data: CatUpdate }) =>
      apiFetch<Cat, CatUpdate>({ url: `/api/cats/${catId}`, method: "PATCH", body: data }),
    onSuccess: (_, { catId }) => {
      queryClient.invalidateQueries({ queryKey: catKeys.lists() });
      queryClient.invalidateQueries({ queryKey: catKeys.detail(catId) });
    },
  });
}

export function useDeleteCat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (catId: number) => apiFetch<void>({ url: `/api/cats/${catId}`, method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: catKeys.lists() }),
  });
}
