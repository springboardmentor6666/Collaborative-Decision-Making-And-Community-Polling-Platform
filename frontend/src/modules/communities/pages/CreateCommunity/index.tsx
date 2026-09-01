import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCommunityMutations } from "../../hooks/useCommunityMutations";
import { CommunityVisibility } from "../../types/community";

export default function CreateCommunity() {
  const navigate = useNavigate();
  const { createCommunity } = useCommunityMutations();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<CommunityVisibility>("PUBLIC");
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
      { name, description, visibility, image },
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
          <Link to="/communities">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create a Community</h1>
          <p className="text-slate-500 mt-1">Start a new space for collaboration and decision making.</p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900">Community Details</CardTitle>
          <CardDescription className="text-slate-500">Fill out the information below to set up your community.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-slate-700">
                Community Name <span className="text-red-500">*</span>
              </label>
              <Input 
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Open Source Developers"
                className="bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus-visible:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this community about?"
                rows={4}
                className="w-full flex rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="visibility" className="text-sm font-semibold text-slate-700">
                Visibility <span className="text-red-500">*</span>
              </label>
              <select 
                id="visibility"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as CommunityVisibility)}
                className="w-full flex rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <option value="PUBLIC">Public (Anyone can see and join)</option>
                <option value="PRIVATE">Private (Invite only)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-semibold text-slate-700">
                Banner Image URL (Optional)
              </label>
              <Input 
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/banner.jpg"
                className="bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus-visible:ring-blue-500"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" asChild className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                <Link to="/communities">Cancel</Link>
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
