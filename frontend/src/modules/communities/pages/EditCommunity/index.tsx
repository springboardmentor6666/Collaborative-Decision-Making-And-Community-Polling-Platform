import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCommunity } from "../../hooks/useCommunity";
import { useCommunityMutations } from "../../hooks/useCommunityMutations";
import { CommunityVisibility } from "../../types/community";
import { useAuth } from "@/context/AuthContext";

export default function EditCommunity() {
  const { id } = useParams<{ id: string }>();
  const communityId = parseInt(id || "0", 10);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: community, isLoading } = useCommunity(communityId);
  const { updateCommunity } = useCommunityMutations();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<CommunityVisibility>("PUBLIC");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (community) {
      if (community.owner.userId !== user?.userId && user?.role !== "ROLE_ADMIN") {
        navigate(`/communities/${communityId}`);
        return;
      }
      setName(community.name);
      setDescription(community.description || "");
      setVisibility(community.visibility);
      setImage(community.image || "");
    }
  }, [community, user, navigate, communityId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.length < 3) {
      setError("Community name must be at least 3 characters long.");
      return;
    }

    updateCommunity.mutate(
      { id: communityId, data: { name, description, visibility, image } },
      {
        onSuccess: () => {
          navigate(`/communities/${communityId}`);
        },
        onError: (err: any) => {
          setError(err.response?.data?.message || "Failed to update community. Please try again.");
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="h-10 w-10 rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
          <Link to={`/communities/${communityId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Community</h1>
          <p className="text-slate-500 mt-1">Update details for {community?.name}</p>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900">Community Settings</CardTitle>
          <CardDescription className="text-slate-500">Modify the information below.</CardDescription>
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
                <Link to={`/communities/${communityId}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={updateCommunity.isPending} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                {updateCommunity.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
