import { UserResponse } from '@/types';

export interface AuditLogResponse {
  id: number;
  actor: UserResponse;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress?: string;
  details?: string;
  createdAt: string;
}
