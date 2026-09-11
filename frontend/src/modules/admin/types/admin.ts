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
