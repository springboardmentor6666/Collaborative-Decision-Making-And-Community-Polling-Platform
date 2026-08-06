export interface DashboardStats {
  totalUsers: number;
  totalDecisions: number;
  totalCommunities: number;
  totalVotes: number;
  activePolls: number;
  participationRate: number;
  dailyActivity: Array<{
    date: string;
    votes: number;
    newMembers: number;
    decisions: number;
  }>;
}

export interface CommunityAnalytics {
  communityId: number;
  totalMembers: number;
  activeMembers: number;
  communityGrowth: Array<{
    date: string;
    votes: number;
    newMembers: number;
    decisions: number;
  }>;
}

export interface DecisionAnalytics {
  decisionId: number;
  totalVotes: number;
  participationRate: number;
  winningOption: string;
  optionsData: Array<{
    title: string;
    votes: number;
    score: number;
  }>;
}

export interface UserAnalytics {
  userId: number;
  totalCreatedDecisions: number;
}
