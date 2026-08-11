import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";
import { UserResponse, PagedResponse } from "@/types";
import { AuditLogResponse } from "../types/admin";

export const useAllUsers = (page = 0, size = 10) => {
  return useQuery<PagedResponse<UserResponse>, Error>({
    queryKey: ["admin-users", page, size],
    queryFn: () => adminApi.getAllUsers(page, size),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const useAuditLogs = (page = 0, size = 10) => {
  return useQuery<PagedResponse<AuditLogResponse>, Error>({
    queryKey: ["audit-logs", page, size],
    queryFn: () => adminApi.getAuditLogs(page, size),
  });
};
