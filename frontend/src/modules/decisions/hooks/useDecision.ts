import { useQuery } from "@tanstack/react-query";
import { decisionApi } from "../api/decisionApi";

export const useDecision = (id: number) => {
  return useQuery({
    queryKey: ["decisions", "detail", id],
    queryFn: () => decisionApi.getDecisionById(id),
    enabled: !!id,
  });
};
