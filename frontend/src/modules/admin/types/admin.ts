import { UserResponse } from '@/types';

export interface AuditLogResponse {
  logId?: number;
  id?: number;
  user?: UserResponse;
  actor?: UserResponse;
  action: string;
  entityType?: string;
  resourceType?: string;
  entityId?: number;
  resourceId?: string | number;
  ipAddress?: string;
  details?: string;
  createdAt: string;
}

export interface CreateAdminUserRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
  role: 'ROLE_ADMIN' | 'ROLE_MODERATOR' | 'ROLE_USER';
}

export interface UpdateUserRoleRequest {
  role: 'ROLE_ADMIN' | 'ROLE_MODERATOR' | 'ROLE_USER';
}

