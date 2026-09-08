import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Loader2, Sparkles, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDecision } from "../../hooks/useDecision";
import { useDecisionMutations } from "../../hooks/useDecisionMutations";
import { useCommunities } from "@/modules/communities/hooks/useCommunities";
import { OptionRequest, VoteType, DecisionVisibility } from "../../types/decision";
import { FileUploadDropzone } from "@/components/common/FileUploadDropzone";
import { FileUploadResult } from "@/api/fileApi";

export default function EditDecision() {
  const { id } = useParams<{ id: string }>();
  const decisionId = parseInt(id || "0", 10);
  
  const navigate = useNavigate();
  const { data: decision, isLoading } = useDecision(decisionId);
  const { updateDecision } = useDecisionMutations();
  
  const { data: communitiesData } = useCommunities({});
  const communities = communitiesData?.content || [];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [communityId, setCommunityId] = useState<string>("none");
  const [voteType, setVoteType] = useState<VoteType>("SINGLE");
  const [visibility, setVisibility] = useState<DecisionVisibility>("PUBLIC");
  const [deadline, setDeadline] = useState("");
  const [allowAnonymousVote, setAllowAnonymousVote] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResult[]>([]);
  const [options, setOptions] = useState<OptionRequest[]>([{ title: "" }, { title: "" }]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (decision) {
      setTitle(decision.title);
      setDescription(decision.description || "");
      setCommunityId(decision.community ? decision.community.communityId?.toString() : "none");
      setVoteType(decision.voteType);
      setVisibility(decision.visibility);
      setAllowAnonymousVote(decision.allowAnonymousVote);
      
      if (decision.deadline) {
        const formatted = decision.deadline.includes('T') 
          ? decision.deadline.substring(0, 16) 
          : decision.deadline;
        setDeadline(formatted);
      }
      
      if (decision.options && decision.options.length > 0) {
        setOptions(decision.options.map(o => ({ title: o.title, description: o.description })));
      }

      if (decision.attachments && decision.attachments.length > 0) {
        setUploadedFiles(decision.attachments.map(a => ({
          attachmentId: a.attachmentId,
          fileName: a.fileName,
          fileUrl: a.fileUrl,
          fileType: a.fileType,
          fileSize: 0,
        })));
      }
    }
  }, [decision]);

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
      parsedDeadline = deadline.length === 16 ? `${deadline}:00` : deadline;
    }

    const attachmentIds = uploadedFiles
      .map(f => f.attachmentId)
      .filter((id): id is number => typeof id === "number");

    updateDecision.mutate({
      id: decisionId,
      data: {
        title,
        description: description || undefined,
        communityId: communityId !== "none" ? parseInt(communityId, 10) : undefined,
        voteType,
        visibility,
        deadline: parsedDeadline,
        allowAnonymousVote,
        options: validOptions,
        attachmentIds: attachmentIds.length > 0 ? attachmentIds : undefined,
      }
    }, {
      onSuccess: () => {
        navigate(`/decisions/${decisionId}`);
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || "Failed to update decision.");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!decision) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted-foreground">
        Decision not found.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button asChild variant="ghost" className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
        <Link to={`/decisions/${decisionId}`}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Decision
        </Link>
      </Button>

      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <span>Edit Decision</span>
          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground font-semibold">Decision Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              className="bg-background border-border text-foreground min-h-[120px] focus-visible:ring-blue-500"
            />
          </div>

          {/* Media Attachments Dropzone */}
          <div className="space-y-2">
            <Label className="text-foreground font-semibold flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-blue-500" />
              <span>Media & Evidence (Images, Videos, PDFs)</span>
            </Label>
            <FileUploadDropzone
              onFilesUploaded={(files) => setUploadedFiles(files)}
              existingFiles={uploadedFiles}
              maxFiles={6}
              folder="decisions"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="community" className="text-foreground font-semibold">Community</Label>
              <Select value={communityId} onValueChange={setCommunityId}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select a community (Optional)" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
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
              <Label htmlFor="visibility" className="text-foreground font-semibold">Visibility <span className="text-red-500">*</span></Label>
              <Select value={visibility} onValueChange={(val) => setVisibility(val as DecisionVisibility)}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="PUBLIC">Public</SelectItem>
                  <SelectItem value="PRIVATE">Private (Invite / Link Only)</SelectItem>
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
            <Button type="submit" disabled={updateDecision.isPending} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xs">
              {updateDecision.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
            <Button type="button" variant="outline" asChild className="flex-1 border-border hover:bg-muted text-foreground">
              <Link to={`/decisions/${decisionId}`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
