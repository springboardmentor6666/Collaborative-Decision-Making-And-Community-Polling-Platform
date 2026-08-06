import { useMutation, useQueryClient } from "@tanstack/react-query";
import { decisionApi } from "../api/decisionApi";
import { DecisionRequest } from "../types/decision";

export const useDecisionMutations = () => {
  const queryClient = useQueryClient();

  const invalidateDecisionLists = () => {
    queryClient.invalidateQueries({ queryKey: ["decisions", "search"] });
    queryClient.invalidateQueries({ queryKey: ["decisions", "trending"] });
    queryClient.invalidateQueries({ queryKey: ["decisions", "popular"] });
    queryClient.invalidateQueries({ queryKey: ["decisions", "latest"] });
    queryClient.invalidateQueries({ queryKey: ["decisions", "saved"] });
  };

  const createDecision = useMutation({
    mutationFn: (data: DecisionRequest) => decisionApi.createDecision(data),
    onSuccess: () => {
      invalidateDecisionLists();
    },
  });

  const updateDecision = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DecisionRequest }) => decisionApi.updateDecision(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["decisions", "detail", variables.id] });
      invalidateDecisionLists();
    },
  });

  const deleteDecision = useMutation({
    mutationFn: (id: number) => decisionApi.deleteDecision(id),
    onSuccess: () => {
      invalidateDecisionLists();
    },
  });

  const saveDecision = useMutation({
    mutationFn: (id: number) => decisionApi.saveDecision(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["decisions", "saved"] });
      // We might want to invalidate the specific decision to update its state if we returned saved status in detail
    },
  });

  const unsaveDecision = useMutation({
    mutationFn: (id: number) => decisionApi.unsaveDecision(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["decisions", "saved"] });
    },
  });

  return {
    createDecision,
    updateDecision,
    deleteDecision,
    saveDecision,
    unsaveDecision,
  };
};
