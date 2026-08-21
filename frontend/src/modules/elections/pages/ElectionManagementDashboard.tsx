import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { 
  useElection, 
  useUpdateElection, 
  usePublishElection, 
  useStartElection, 
  useCloseElection,
  useElectionCategories,
  useDeleteCategory,
  usePublishResults
} from "../hooks/useElections";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CategoryFormModal } from "../components/CategoryFormModal";
import { AdminNomineesList } from "../components/AdminNomineesList";
import { VotingCategory } from "../types";

export default function ElectionManagementDashboard() {
  const { id, eventId } = useParams<{ id: string; eventId: string }>();
  const communityId = parseInt(id || "0", 10);
  const parsedEventId = parseInt(eventId || "0", 10);

  const { data: election, isLoading: isLoadingElection } = useElection(parsedEventId);
  const { data: categories, isLoading: isLoadingCategories } = useElectionCategories(parsedEventId);
  
  const publishMutation = usePublishElection();
  const startMutation = useStartElection();
  const closeMutation = useCloseElection();
  const publishResultsMutation = usePublishResults();
  const deleteCategoryMutation = useDeleteCategory();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VotingCategory | undefined>(undefined);

  if (isLoadingElection || isLoadingCategories) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!election) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold">Voting Event not found</h2>
        <Button asChild className="mt-4">
          <Link to={`/communities/${communityId}/admin`}>Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const handleAction = (action: 'publish' | 'start' | 'close' | 'publish-results') => {
    if (action === 'publish-results') {
      publishResultsMutation.mutate(parsedEventId, {
        onSuccess: () => toast.success(`Election results published successfully`),
        onError: (err: any) => toast.error(err.response?.data?.message || `Failed to publish results`)
      });
      return;
    }
    const mutation = action === 'publish' ? publishMutation : action === 'start' ? startMutation : closeMutation;
    mutation.mutate(parsedEventId, {
      onSuccess: () => toast.success(`Election ${action}ed successfully`),
      onError: (err: any) => toast.error(err.response?.data?.message || `Failed to ${action} election`)
    });
  };

  const handleEditCategory = (cat: VotingCategory) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteCategoryMutation.mutate({ eventId: parsedEventId, categoryId }, {
        onSuccess: () => toast.success("Category deleted"),
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to delete category")
      });
    }
  };

  const canModifyCategories = election.status !== 'ACTIVE' && election.status !== 'CLOSED' && election.status !== 'CANCELLED';

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/communities/${communityId}/admin`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-1">Manage Election: {election.title}</h1>
            <Badge>{election.status}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {election.status === 'DRAFT' && (
            <Button onClick={() => handleAction('publish')} disabled={publishMutation.isPending}>Publish</Button>
          )}
          {election.status === 'UPCOMING' && (
            <Button onClick={() => handleAction('start')} disabled={startMutation.isPending}>Start Voting</Button>
          )}
          {election.status === 'ACTIVE' && (
            <Button variant="destructive" onClick={() => handleAction('close')} disabled={closeMutation.isPending}>Close Voting</Button>
          )}
          {election.status === 'CLOSED' && !election.resultsPublished && (
            <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700" 
              onClick={() => handleAction('publish-results')} 
              disabled={publishResultsMutation.isPending}
            >
              Publish Results
            </Button>
          )}
          {election.status === 'CLOSED' && election.resultsPublished && (
            <Button variant="outline" disabled>Results Published</Button>
          )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Categories & Nominees</h2>
            {canModifyCategories && (
              <Button onClick={() => { setEditingCategory(undefined); setIsCategoryModalOpen(true); }} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            )}
          </div>
          
          {categories?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No categories found. Create one to get started!
              </CardContent>
            </Card>
          ) : (
            categories?.map(category => (
              <Card key={category.categoryId}>
                <CardHeader className="flex flex-row items-start justify-between bg-slate-50 border-b">
                  <div>
                    <CardTitle className="text-xl">{category.name}</CardTitle>
                    <CardDescription>{category.description} (Max selections: {category.maxSelections})</CardDescription>
                  </div>
                  {canModifyCategories && (
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" onClick={() => handleEditCategory(category)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteCategory(category.categoryId)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-4">
                  <AdminNomineesList categoryId={category.categoryId} />
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Election Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="font-semibold text-sm text-slate-500">Start Date:</span>
                <p>{new Date(election.startDate).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-semibold text-sm text-slate-500">End Date:</span>
                <p>{new Date(election.endDate).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-semibold text-sm text-slate-500">Results Visibility:</span>
                <p className="text-sm mt-1">{election.resultsVisible.replace(/_/g, ' ')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <CategoryFormModal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
        eventId={parsedEventId}
        existingCategory={editingCategory}
      />
    </div>
  );
}

