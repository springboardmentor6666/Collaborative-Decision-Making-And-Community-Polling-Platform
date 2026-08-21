import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft, Calendar, Award, CheckCircle2 } from "lucide-react";
import { useElection, useElectionCategories, useCategoryNominees, useSubmitVote } from "../hooks/useElections";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Nominee, VotingCategory } from "../types";
import { ElectionResults } from "../components/ElectionResults";

export default function ElectionDetails() {
  const { id, eventId } = useParams<{ id: string; eventId: string }>();
  const parsedEventId = parseInt(eventId || "0", 10);
  const communityId = parseInt(id || "0", 10);

  const [activeTab, setActiveTab] = useState<'voting' | 'results'>('voting');

  const { data: election, isLoading: isLoadingElection } = useElection(parsedEventId);
  const { data: categories, isLoading: isLoadingCategories } = useElectionCategories(parsedEventId);

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
        <h2 className="text-2xl font-bold">Voting Arena not found</h2>
        <Button asChild className="mt-4">
          <Link to={`/communities/${communityId}`}>Return to Community</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      <div>
        <Link to={`/communities/${communityId}`} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Community
        </Link>
      </div>

      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-3xl p-8 md:p-12 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Badge className="bg-white/20 text-white hover:bg-white/30 mb-4 backdrop-blur-sm border-none">
              {election.status === "ACTIVE" ? "🟢 Active Arena" : election.status}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{election.title}</h1>
            <p className="text-blue-100 text-lg max-w-2xl">{election.description}</p>
          </div>
          <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-md flex flex-col items-center min-w-[200px]">
            <Calendar className="w-6 h-6 mb-2 text-blue-200" />
            <div className="text-sm font-medium text-blue-100">Voting Ends</div>
            <div className="text-xl font-bold">{new Date(election.endDate).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <div className="flex gap-8">
          <button 
            onClick={() => setActiveTab('voting')}
            className={`pb-4 text-lg font-medium transition-colors relative ${activeTab === 'voting' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Voting
            {activeTab === 'voting' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
          <button 
            onClick={() => setActiveTab('results')}
            className={`pb-4 text-lg font-medium transition-colors relative ${activeTab === 'results' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Results
            {activeTab === 'results' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
          </button>
        </div>
      </div>

      {activeTab === 'voting' ? (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {categories?.map((category) => (
            <CategorySection key={category.categoryId} category={category} electionStatus={election.status} />
          ))}
        </div>
      ) : (
        <ElectionResults eventId={parsedEventId} />
      )}
    </div>
  );
}

function CategorySection({ category, electionStatus }: { category: VotingCategory, electionStatus: string }) {
  const { data: nominees, isLoading } = useCategoryNominees(category.categoryId);
  const [selectedNominee, setSelectedNominee] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const submitVote = useSubmitVote();

  const handleVote = () => {
    if (!selectedNominee) return;
    submitVote.mutate(
      { categoryId: category.categoryId, data: { nomineeId: selectedNominee } },
      {
        onSuccess: () => {
          setHasVoted(true);
          toast.success("Vote submitted successfully!");
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to submit vote. You might have already voted.");
        }
      }
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="border-b border-[#E2E8F0] bg-slate-50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-blue-500" />
            {category.title}
          </h2>
          <p className="text-slate-500 mt-1">{category.description}</p>
        </div>
        {hasVoted ? (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 px-3 py-1 text-sm border-none">
            <CheckCircle2 className="w-4 h-4 mr-1" /> Voted
          </Badge>
        ) : (
          <Button 
            onClick={handleVote} 
            disabled={!selectedNominee || submitVote.isPending || electionStatus !== "ACTIVE"}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
          >
            {submitVote.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Vote"}
          </Button>
        )}
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nominees?.map((nominee) => (
              <NomineeCard 
                key={nominee.nomineeId}
                nominee={nominee}
                isSelected={selectedNominee === nominee.nomineeId}
                onSelect={() => !hasVoted && setSelectedNominee(nominee.nomineeId)}
                disabled={hasVoted || electionStatus !== "ACTIVE"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NomineeCard({ nominee, isSelected, onSelect, disabled }: { nominee: Nominee, isSelected: boolean, onSelect: () => void, disabled: boolean }) {
  return (
    <div 
      onClick={() => { if (!disabled) onSelect(); }}
      className={`relative rounded-2xl border-2 transition-all cursor-pointer overflow-hidden group ${
        isSelected ? 'border-blue-500 shadow-md ring-4 ring-blue-50' : 'border-[#E2E8F0] hover:border-blue-300'
      } ${disabled && !isSelected ? 'opacity-60 cursor-not-allowed grayscale-[50%]' : ''}`}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 z-10 bg-blue-500 text-white rounded-full p-1 shadow-sm">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      )}
      <div className="aspect-video bg-slate-100 overflow-hidden relative">
        {nominee.imageUrl ? (
          <img src={nominee.imageUrl} alt={nominee.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium text-4xl bg-gradient-to-br from-slate-100 to-slate-200">
            {nominee.name.charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-5 bg-white relative z-10">
        <h3 className="text-lg font-bold text-slate-900 mb-1">{nominee.name}</h3>
        <p className="text-slate-500 text-sm line-clamp-2">{nominee.description}</p>
      </div>
    </div>
  );
}
