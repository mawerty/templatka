/**
 * Users API hooks - example CRUD operations.
 *
 * NOTE: W prawdziwym projekcie te hooki są AUTO-GENEROWANE przez:
 *   pnpm api
 *
 * Ten plik to przykład jak wyglądają wygenerowane hooki.
 * Po uruchomieniu `pnpm api` zamień ten plik na wygenerowany.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, buildQueryString } from "./fetcher";

// Types (będą auto-generowane z OpenAPI)
export type User = {
  id: number;
  name: string;
  email: string;
  created_at: number;
  updated_at: number;
  is_active: boolean;
  avatar_url: string | null;
};

export type UserCreate = {
  name: string;
  email: string;
};

export type UserUpdate = {
  name?: string;
  email?: string;
  is_active?: boolean;
  avatar_url?: string | null;
};

// Query keys factory
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: { skip?: number; limit?: number }) =>
    [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

// Hooks
export function useUsers(params: { skip?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () =>
      apiFetch<User[]>({
        url: `/api/users${buildQueryString(params)}`,
      }),
  });
}

export function useUser(userId: number) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () =>
      apiFetch<User>({
        url: `/api/users/${userId}`,
      }),
    enabled: !!userId,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserCreate) =>
      apiFetch<User, UserCreate>({
        url: "/api/users",
        method: "POST",
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UserUpdate }) =>
      apiFetch<User, UserUpdate>({
        url: `/api/users/${userId}`,
        method: "PATCH",
        body: data,
      }),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) =>
      apiFetch<void>({
        url: `/api/users/${userId}`,
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

