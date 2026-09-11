import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Loader2, Sparkles, Paperclip, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDecisionMutations } from "../../hooks/useDecisionMutations";
import { useMyCommunities } from "@/modules/communities/hooks/useCommunities";
import { useCommunity } from "@/modules/communities/hooks/useCommunity";
import { OptionRequest, VoteType, DecisionVisibility } from "../../types/decision";
import { FileUploadDropzone } from "@/components/common/FileUploadDropzone";
import { FileUploadResult } from "@/api/fileApi";
import { toast } from "sonner";

export default function CreateDecision() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramCommunityId = searchParams.get("communityId");
  const paramVisibility = searchParams.get("visibility");

  const { createDecision } = useDecisionMutations();
  
  // Fetch communities the user is a member of to select from
  const { data: myCommunitiesData } = useMyCommunities({ size: 100 });
  const targetCommunityIdNum = paramCommunityId ? parseInt(paramCommunityId, 10) : 0;
  const { data: targetCommunity } = useCommunity(targetCommunityIdNum);

  const communities = useMemo(() => {
    const list = [...(myCommunitiesData?.content || [])];
    if (targetCommunity && !list.some((c: any) => c.communityId === targetCommunity.communityId)) {
      list.unshift(targetCommunity);
    }
    return list;
  }, [myCommunitiesData, targetCommunity]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [communityId, setCommunityId] = useState<string>(paramCommunityId || "none");
  const [voteType, setVoteType] = useState<VoteType>("SINGLE");
  const [visibility, setVisibility] = useState<DecisionVisibility>(
    (paramVisibility as DecisionVisibility) || "PUBLIC"
  );
  const [deadline, setDeadline] = useState("");
  const [allowAnonymousVote, setAllowAnonymousVote] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResult[]>([]);
  
  const [options, setOptions] = useState<OptionRequest[]>([
    { title: "" },
    { title: "" }
  ]);
  const [error, setError] = useState("");

  // Sync state when URL params or target community are loaded
  useEffect(() => {
    if (paramCommunityId) {
      setCommunityId(paramCommunityId);
    }
    if (paramVisibility === "PRIVATE" || paramVisibility === "PUBLIC") {
      setVisibility(paramVisibility as DecisionVisibility);
    } else if (targetCommunity) {
      if (targetCommunity.visibility === "PRIVATE") {
        setVisibility("PRIVATE");
      }
    }
  }, [paramCommunityId, paramVisibility, targetCommunity]);

  // Handle community change with automatic visibility matching
  const handleCommunityChange = (selectedVal: string) => {
    setCommunityId(selectedVal);
    if (selectedVal === "none") {
      setVisibility("PUBLIC");
    } else {
      const selectedComm = communities.find((c: any) => c.communityId.toString() === selectedVal);
      if (selectedComm) {
        if (selectedComm.visibility === "PRIVATE") {
          setVisibility("PRIVATE");
        } else {
          setVisibility("PUBLIC");
        }
      }
    }
  };

  const isSelectedCommunityPrivate = useMemo(() => {
    if (communityId === "none") return false;
    const currentComm = communities.find((c: any) => c.communityId.toString() === communityId);
    return currentComm?.visibility === "PRIVATE" || (targetCommunity?.communityId.toString() === communityId && targetCommunity?.visibility === "PRIVATE");
  }, [communityId, communities, targetCommunity]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || title.trim().length < 3) {
      const msg = "Please enter a decision title (at least 3 characters).";
      setError(msg);
      toast.error(msg);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const validOptions = options.filter(opt => opt.title.trim().length > 0);
    if (validOptions.length < 2) {
      const msg = "Please provide at least two valid poll options.";
      setError(msg);
      toast.error(msg);
      return;
    }

    let parsedDeadline = undefined;
    if (deadline) {
      const date = new Date(deadline);
      if (date <= new Date()) {
        const msg = "Deadline must be a future date and time.";
        setError(msg);
        toast.error(msg);
        return;
      }
      parsedDeadline = deadline.length === 16 ? `${deadline}:00` : deadline;
    }

    const attachmentIds = uploadedFiles
      .map(f => f.attachmentId)
      .filter((id): id is number => typeof id === "number");

    try {
      const result: any = await createDecision.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        communityId: communityId !== "none" ? parseInt(communityId, 10) : undefined,
        voteType,
        visibility: isSelectedCommunityPrivate ? "PRIVATE" : visibility,
        deadline: parsedDeadline,
        allowAnonymousVote,
        options: validOptions,
        attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
      });

      const newDecisionId = result?.decisionId || result?.data?.decisionId || result?.id;
      if (newDecisionId) {
        navigate(`/decisions/${newDecisionId}`);
      } else {
        navigate(backUrl);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create decision. Please try again.";
      setError(msg);
      toast.error(msg);
    }
  };

  const backUrl = paramCommunityId ? `/communities/${paramCommunityId}` : "/decisions";

  const handleBack = (e?: React.MouseEvent) => {
    if (window.history.state && window.history.state.idx > 0) {
      e?.preventDefault();
      navigate(-1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
      <Button 
        asChild
        type="button" 
        variant="ghost" 
        className="mb-6 -ml-4 text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-2 font-medium"
      >
        <Link to={backUrl} onClick={handleBack}>
          <ArrowLeft className="w-4 h-4" />
          <span>{paramCommunityId ? "Back to Community" : "Back to Decisions"}</span>
        </Link>
      </Button>

      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <span>Create New Decision</span>
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
            {error}
          </div>
        )}

        <form noValidate onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground font-semibold">Decision Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Which frontend framework should we adopt?"
              className="bg-background border-border text-foreground focus-visible:ring-blue-500"
              required
              minLength={3}
              maxLength={150}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground font-semibold">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide background context and requirements..."
              className="bg-background border-border text-foreground min-h-[120px] focus-visible:ring-blue-500"
            />
          </div>

          {/* Media & Attachments Dropzone */}
          <div className="space-y-2">
            <Label className="text-foreground font-semibold flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-blue-500" />
              <span>Media & Evidence (Images, Videos, PDFs)</span>
            </Label>
            <FileUploadDropzone
              onFilesUploaded={(files) => setUploadedFiles(files)}
              maxFiles={6}
              folder="decisions"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="community" className="text-foreground font-semibold">Community</Label>
              <Select value={communityId} onValueChange={handleCommunityChange}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select a community (Optional)" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="none">None (Global Decision)</SelectItem>
                  {communities.map((c: any) => (
                    <SelectItem key={c.communityId} value={c.communityId.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{c.name}</span>
                        {c.visibility === "PRIVATE" && (
                          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Private
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voteType" className="text-foreground font-semibold">Vote Type <span className="text-red-500">*</span></Label>
              <Select value={voteType} onValueChange={(val) => setVoteType(val as VoteType)}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="SINGLE">Single Choice</SelectItem>
                  <SelectItem value="MULTIPLE">Multiple Choice</SelectItem>
                  <SelectItem value="RATING">Rating (Score)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="visibility" className="text-foreground font-semibold">Visibility <span className="text-red-500">*</span></Label>
                {isSelectedCommunityPrivate && (
                  <span className="text-xs text-amber-500 flex items-center gap-1 font-medium">
                    <Lock className="w-3 h-3" /> Inherited from Community
                  </span>
                )}
              </div>
              <Select 
                value={visibility} 
                onValueChange={(val) => setVisibility(val as DecisionVisibility)}
                disabled={isSelectedCommunityPrivate}
              >
                <SelectTrigger className="bg-background border-border text-foreground disabled:opacity-85 disabled:cursor-not-allowed">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="PUBLIC">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Public</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PRIVATE">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Private (Community / Invite Only)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline" className="text-foreground font-semibold">Deadline (Optional)</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-background border-border text-foreground focus-visible:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/40 border border-border rounded-xl">
            <div className="space-y-0.5">
              <Label className="text-foreground font-semibold">Allow Anonymous Voting</Label>
              <p className="text-xs text-muted-foreground">Users can vote without their identity being publicly visible</p>
            </div>
            <Switch 
              checked={allowAnonymousVote} 
              onCheckedChange={setAllowAnonymousVote}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-foreground font-bold text-base">Poll Options <span className="text-red-500">*</span></Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="border-border hover:bg-muted text-foreground text-xs font-semibold">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
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
                    className="bg-background border-border text-foreground focus-visible:ring-blue-500"
                    required
                  />
                  {options.length > 2 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveOption(index)}
                      className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <Button type="submit" disabled={createDecision.isPending} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs">
              {createDecision.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Publish Decision
            </Button>
            <Button 
              asChild
              type="button" 
              variant="outline" 
              className="flex-1 border-border hover:bg-muted text-foreground cursor-pointer"
            >
              <Link to={backUrl} onClick={handleBack}>
                Cancel
              </Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
