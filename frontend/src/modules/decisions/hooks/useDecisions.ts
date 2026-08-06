import { useQuery } from "@tanstack/react-query";
import { decisionApi, SearchDecisionsParams } from "../api/decisionApi";

export const useDecisions = (params: SearchDecisionsParams) => {
  return useQuery({
    queryKey: ["decisions", "search", params],
    queryFn: () => decisionApi.searchDecisions(params),
  });
};

export const useTrendingDecisions = (params: { page?: number; size?: number } = {}) => {
  return useQuery({
    queryKey: ["decisions", "trending", params],
    queryFn: () => decisionApi.getTrending(params),
  });
};

export const usePopularDecisions = (params: { page?: number; size?: number } = {}) => {
  return useQuery({
    queryKey: ["decisions", "popular", params],
    queryFn: () => decisionApi.getPopular(params),
  });
};

export const useLatestDecisions = (params: { page?: number; size?: number } = {}) => {
  return useQuery({
    queryKey: ["decisions", "latest", params],
    queryFn: () => decisionApi.getLatest(params),
  });
};

export const useSavedDecisions = (params: { page?: number; size?: number } = {}) => {
  return useQuery({
    queryKey: ["decisions", "saved", params],
    queryFn: () => decisionApi.getSavedDecisions(params),
  });
};
