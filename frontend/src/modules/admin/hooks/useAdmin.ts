import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/adminApi";
import { UserResponse, PagedResponse } from "@/types";
import { AuditLogResponse, CreateAdminUserRequest } from "../types/admin";

export const useAllUsers = (page = 0, size = 100) => {
  return useQuery<PagedResponse<UserResponse>, Error>({
    queryKey: ["admin-users", page, size],
    queryFn: () => adminApi.getAllUsers(page, size),
  });
};

export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAdminUserRequest) => adminApi.createAdminUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: 'ROLE_ADMIN' | 'ROLE_MODERATOR' | 'ROLE_USER' }) =>
      adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status, reason }: { userId: number; status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'; reason?: string }) =>
      adminApi.updateUserStatus(userId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["global-abuse-reports"] });
      queryClient.invalidateQueries({ queryKey: ["community-abuse-reports"] });
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
};

export const useAuditLogs = (page = 0, size = 10) => {
  return useQuery<PagedResponse<AuditLogResponse>, Error>({
    queryKey: ["audit-logs", page, size],
    queryFn: () => adminApi.getAuditLogs(page, size),
  });
};

