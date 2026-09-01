export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface UserResponse {
  userId: number;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  profileImage?: string;
  bio?: string;
  role: string;
  provider?: string;
  accountStatus?: string;
  emailVerified?: boolean;
  createdAt: string;
}

export interface DecisionResponse {
  id: number;
  title: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'OPEN' | 'VOTING' | 'RESOLVED' | 'CLOSED' | 'ARCHIVED';
  visibility: 'PUBLIC' | 'PRIVATE' | 'COMMUNITY_ONLY';
  voteType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'RANKED_CHOICE' | 'APPROVAL';
  options: any[]; // Depending on options structure
  communityId?: number;
  communityName?: string;
  createdBy: {
    id: number;
    username: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  voteCount: number;
  commentCount: number;
}

export interface CommunityResponse {
  communityId: number;
  name: string;
  description: string;
  owner: UserResponse;
  visibility: string;
  image?: string;
  memberCount: number;
  createdAt: string;
}

export type MemberRole = 'OWNER' | 'MODERATOR' | 'MEMBER';
export type MemberStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'LEFT' | 'BANNED';

export interface CommunityMemberResponse {
  memberId: number;
  communityId: number;
  user: UserResponse;
  memberRole: MemberRole;
  status: MemberStatus;
  joinedAt: string;
}

export interface NotificationResponse {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  referenceId: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalCommunities: number;
  openDecisions: number;
  totalVotesCast: number;
  unreadNotifications: number;
}
