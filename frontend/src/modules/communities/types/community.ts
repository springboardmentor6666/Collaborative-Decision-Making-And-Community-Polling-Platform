import { UserResponse } from "@/types";

export type CommunityVisibility = "PUBLIC" | "PRIVATE";
export type MemberRole = "OWNER" | "MODERATOR" | "MEMBER";
export type MemberStatus = "ACTIVE" | "PENDING" | "REJECTED" | "BANNED" | "LEFT";

export interface CommunityResponse {
  communityId: number;
  name: string;
  description: string;
  owner: UserResponse;
  visibility: CommunityVisibility;
  image: string;
  memberCount: number;
  createdAt: string;
}

export interface CommunityRequest {
  name: string;
  description?: string;
  visibility: CommunityVisibility;
  image?: string;
}

export interface CommunityMemberResponse {
  memberId: number;
  communityId: number;
  user: UserResponse;
  memberRole: MemberRole;
  status: MemberStatus;
  joinedAt: string;
}
