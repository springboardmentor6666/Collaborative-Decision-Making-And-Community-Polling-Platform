import axiosInstance from "@/api/axios";
import { VotingEvent, VotingCategory, Nominee, ElectionVoteRequest, VotingEventRequest, VotingCategoryRequest, NomineeRequest, ElectionResultsResponse } from "../types";

export const electionsApi = {
  getCommunityElections: async (communityId: number): Promise<VotingEvent[]> => {
    const response = await axiosInstance.get(`/communities/${communityId}/elections`);
    return response.data;
  },

  getElectionById: async (eventId: number): Promise<VotingEvent> => {
    const response = await axiosInstance.get(`/elections/${eventId}`);
    return response.data;
  },

  createElection: async (communityId: number, data: VotingEventRequest): Promise<VotingEvent> => {
    const response = await axiosInstance.post(`/communities/${communityId}/elections`, data);
    return response.data;
  },

  updateElection: async (eventId: number, data: VotingEventRequest): Promise<VotingEvent> => {
    const response = await axiosInstance.put(`/elections/${eventId}`, data);
    return response.data;
  },

  publishElection: async (eventId: number): Promise<void> => {
    await axiosInstance.post(`/elections/${eventId}/publish`);
  },

  startElection: async (eventId: number): Promise<void> => {
    await axiosInstance.post(`/elections/${eventId}/start`);
  },

  closeElection: async (eventId: number): Promise<void> => {
    await axiosInstance.post(`/elections/${eventId}/close`);
  },

  deleteElection: async (eventId: number): Promise<void> => {
    await axiosInstance.delete(`/elections/${eventId}`);
  },

  publishResults: async (eventId: number): Promise<void> => {
    await axiosInstance.post(`/elections/${eventId}/publish-results`);
  },

  getElectionResults: async (eventId: number): Promise<ElectionResultsResponse> => {
    const response = await axiosInstance.get(`/elections/${eventId}/results`);
    return response.data;
  },

  getElectionCategories: async (eventId: number): Promise<VotingCategory[]> => {
    const response = await axiosInstance.get(`/elections/${eventId}/categories`);
    return response.data;
  },

  createCategory: async (eventId: number, data: VotingCategoryRequest): Promise<VotingCategory> => {
    const response = await axiosInstance.post(`/elections/${eventId}/categories`, data);
    return response.data;
  },

  updateCategory: async (eventId: number, categoryId: number, data: VotingCategoryRequest): Promise<VotingCategory> => {
    const response = await axiosInstance.put(`/elections/${eventId}/categories/${categoryId}`, data);
    return response.data;
  },

  deleteCategory: async (eventId: number, categoryId: number): Promise<void> => {
    await axiosInstance.delete(`/elections/${eventId}/categories/${categoryId}`);
  },

  getCategoryNominees: async (categoryId: number): Promise<Nominee[]> => {
    const response = await axiosInstance.get(`/categories/${categoryId}/nominees`);
    return response.data;
  },

  submitNominee: async (categoryId: number, data: NomineeRequest): Promise<Nominee> => {
    const response = await axiosInstance.post(`/categories/${categoryId}/nominations`, data);
    return response.data;
  },

  approveNomination: async (nomineeId: number): Promise<void> => {
    await axiosInstance.post(`/nominations/${nomineeId}/approve`);
  },

  rejectNomination: async (nomineeId: number): Promise<void> => {
    await axiosInstance.post(`/nominations/${nomineeId}/reject`);
  },

  submitVote: async (categoryId: number, data: ElectionVoteRequest): Promise<void> => {
    await axiosInstance.post(`/categories/${categoryId}/vote`, data);
  },
};
