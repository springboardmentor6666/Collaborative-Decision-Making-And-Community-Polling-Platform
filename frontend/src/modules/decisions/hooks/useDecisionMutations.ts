import { useMutation, useQueryClient } from "@tanstack/react-query";
import { decisionApi } from "../api/decisionApi";
import { DecisionRequest } from "../types/decision";
import { toast } from "sonner";

export const useDecisionMutations = () => {
  const queryClient = useQueryClient();

  const invalidateDecisionLists = () => {
    queryClient.invalidateQueries({ queryKey: ["decisions", "search"] });
    queryClient.invalidateQueries({ queryKey: ["decisions", "trending"] });
    queryClient.invalidateQueries({ queryKey: ["decisions", "popular"] });
    queryClient.invalidateQueries({ queryKey: ["decisions", "latest"] });
    queryClient.invalidateQueries({ queryKey: ["decisions", "saved"] });
    queryClient.invalidateQueries({ queryKey: ["saved-decisions"] });
    queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
  };

  const createDecision = useMutation({
    mutationFn: (data: DecisionRequest) => decisionApi.createDecision(data),
    onSuccess: () => {
      invalidateDecisionLists();
      toast.success("Decision created successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create decision");
    }
  });

  const updateDecision = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DecisionRequest }) => decisionApi.updateDecision(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["decisions", "detail", variables.id] });
      invalidateDecisionLists();
      toast.success("Decision updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update decision");
    }
  });

  const deleteDecision = useMutation({
    mutationFn: (id: number) => decisionApi.deleteDecision(id),
    onSuccess: () => {
      invalidateDecisionLists();
      toast.success("Decision deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete decision");
    }
  });

  const saveDecision = useMutation({
    mutationFn: (id: number) => decisionApi.saveDecision(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["decisions", "saved"] });
      queryClient.invalidateQueries({ queryKey: ["saved-decisions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Decision saved to bookmarks");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to save decision");
    }
  });

  const unsaveDecision = useMutation({
    mutationFn: (id: number) => decisionApi.unsaveDecision(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["decisions", "saved"] });
      queryClient.invalidateQueries({ queryKey: ["saved-decisions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      toast.success("Decision removed from saved items");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to remove decision from saved items");
    }
  });

  return {
    createDecision,
    updateDecision,
    deleteDecision,
    saveDecision,
    unsaveDecision,
  };
};
