import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDecisionMutations } from "../../hooks/useDecisionMutations";
import { useCommunities } from "@/modules/communities/hooks/useCommunities";
import { OptionRequest, VoteType, DecisionVisibility } from "../../types/decision";

export default function CreateDecision() {
  const navigate = useNavigate();
  const { createDecision } = useDecisionMutations();
  
  // Fetch communities the user is a member of to select from
  const { data: communitiesData } = useCommunities({});
  const communities = communitiesData?.content || [];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [communityId, setCommunityId] = useState<string>("none");
  const [voteType, setVoteType] = useState<VoteType>("SINGLE");
  const [visibility, setVisibility] = useState<DecisionVisibility>("PUBLIC");
  const [deadline, setDeadline] = useState("");
  const [allowAnonymousVote, setAllowAnonymousVote] = useState(false);
  
  const [options, setOptions] = useState<OptionRequest[]>([
    { title: "" },
    { title: "" }
  ]);
  const [error, setError] = useState("");

  const handleAddOption = () => {
    setOptions([...options, { title: "" }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      setError("A decision requires at least two options.");
      return;
    }
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
    setError("");
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].title = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || title.length < 3) {
      setError("Title must be at least 3 characters long.");
      return;
    }

    const validOptions = options.filter(opt => opt.title.trim().length > 0);
    if (validOptions.length < 2) {
      setError("Please provide at least two valid options.");
      return;
    }

    let parsedDeadline = undefined;
    if (deadline) {
      const date = new Date(deadline);
      if (date <= new Date()) {
        setError("Deadline must be in the future.");
        return;
      }
      parsedDeadline = deadline.length === 16 ? `${deadline}:00` : deadline;
    }

    createDecision.mutate({
      title,
      description: description || undefined,
      communityId: communityId !== "none" ? parseInt(communityId, 10) : undefined,
      voteType,
      visibility,
      deadline: parsedDeadline,
      allowAnonymousVote,
      options: validOptions,
    }, {
      onSuccess: (data) => {
        navigate(`/decisions/${data.decisionId}`);
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || "Failed to create decision. Please try again.");
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button asChild variant="ghost" className="mb-6 -ml-4 text-slate-400 hover:text-white">
        <Link to="/decisions">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Decisions
        </Link>
      </Button>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-white mb-6">Create New Decision</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">Decision Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Which frontend framework should we adopt?"
              className="bg-slate-800 border-slate-700 text-white focus-visible:ring-blue-500"
              required
              minLength={3}
              maxLength={150}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide background context and requirements..."
              className="bg-slate-800 border-slate-700 text-white min-h-[120px] focus-visible:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="community" className="text-slate-300">Community</Label>
              <Select value={communityId} onValueChange={setCommunityId}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select a community (Optional)" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="none">None (Global Decision)</SelectItem>
                  {communities.map((c: any) => (
                    <SelectItem key={c.communityId} value={c.communityId.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voteType" className="text-slate-300">Vote Type <span className="text-red-500">*</span></Label>
              <Select value={voteType} onValueChange={(val) => setVoteType(val as VoteType)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="SINGLE">Single Choice</SelectItem>
                  <SelectItem value="MULTIPLE">Multiple Choice</SelectItem>
                  <SelectItem value="RATING">Rating (Score)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility" className="text-slate-300">Visibility <span className="text-red-500">*</span></Label>
              <Select value={visibility} onValueChange={(val) => setVisibility(val as DecisionVisibility)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="PRIVATE">Private (Invite / Link Only)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-slate-300">Deadline (Optional)</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-slate-300">Allow Anonymous Voting</Label>
              <p className="text-sm text-slate-500">Users can vote without their identity being publicly visible</p>
            </div>
            <Switch 
              checked={allowAnonymousVote} 
              onCheckedChange={setAllowAnonymousVote}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-slate-300 text-lg">Poll Options <span className="text-red-500">*</span></Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="border-slate-700 text-white hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
            
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option.title}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="bg-slate-800 border-slate-700 text-white focus-visible:ring-blue-500"
                    required
                  />
                  {options.length > 2 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveOption(index)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-500/10 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <Button type="submit" disabled={createDecision.isPending} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              {createDecision.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Publish Decision
            </Button>
            <Button type="button" variant="ghost" asChild className="flex-1 text-slate-300 hover:text-white hover:bg-slate-800">
              <Link to="/decisions">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
