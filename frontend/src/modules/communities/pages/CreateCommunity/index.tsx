import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCommunityMutations } from "../../hooks/useCommunityMutations";
import { CommunityVisibility } from "../../types/community";

import { CommunityImageUploader } from "../../components/CommunityImageUploader";

export default function CreateCommunity() {
  const navigate = useNavigate();
  const { createCommunity } = useCommunityMutations();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<CommunityVisibility>("PUBLIC");
  const [profileImage, setProfileImage] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.length < 3) {
      setError("Community name must be at least 3 characters long.");
      return;
    }

    createCommunity.mutate(
      { name, description, visibility, profileImage, image },
      {
        onSuccess: (data) => {
          navigate(`/communities/${data.communityId}`);
        },
        onError: (err: any) => {
          setError(err.response?.data?.message || "Failed to create community. Please try again.");
        }
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button 
          type="button" 
          variant="outline" 
          size="icon" 
          onClick={() => navigate("/communities")} 
          className="h-10 w-10 rounded-full border-border bg-card text-foreground hover:bg-muted cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Create a Community</h1>
          <p className="text-muted-foreground mt-1">Start a new space for collaboration and decision making.</p>
        </div>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">Community Details</CardTitle>
          <CardDescription className="text-muted-foreground">Fill out the information below to set up your community.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-foreground">
                Community Name <span className="text-red-500">*</span>
              </label>
              <Input 
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Open Source Developers"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-semibold text-foreground">
                Description
              </label>
              <textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this community about?"
                rows={4}
                className="w-full flex rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="visibility" className="text-sm font-semibold text-foreground">
                Visibility <span className="text-red-500">*</span>
              </label>
              <select 
                id="visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as CommunityVisibility)}
                className="w-full flex rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <option value="PUBLIC">Public (Anyone can see and join)</option>
                <option value="PRIVATE">Private (Invite only)</option>
              </select>
            </div>

            {/* 1. Community Profile Logo / Avatar */}
            <div className="pt-3 border-t border-border">
              <CommunityImageUploader
                value={profileImage}
                onChange={(url) => setProfileImage(url)}
                type="avatar"
                label="Community Profile Logo / Avatar"
                description="Square or circular icon representing your community badge and icon across cards and member lists."
              />
            </div>

            {/* 2. Community Cover Banner */}
            <div className="pt-3 border-t border-border">
              <CommunityImageUploader
                value={image}
                onChange={(url) => setImage(url)}
                type="cover"
                label="Community Cover Banner"
                description="Landscape cover image displayed at the top of your community page header."
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/communities")} 
                className="border-border bg-card text-foreground hover:bg-muted cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createCommunity.isPending} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                {createCommunity.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Community
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

