import React from 'react';
import { useProfile } from '../hooks/useProfile';
import { ProfileCard } from '../components/ProfileCard';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  const { data: user, isLoading, error } = useProfile();

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">Loading profile...</div>;
  }

  if (error || !user) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-destructive/15 text-destructive p-4 rounded-md flex gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <h3 className="font-medium">Error</h3>
            <p className="text-sm">Failed to load profile. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      <ProfileCard user={user} isCurrentUser={true} />
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder for future activity stats */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="font-medium text-lg mb-4">Activity Stats</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <span className="text-muted-foreground">Decisions Created</span>
                 <span className="font-semibold">N/A</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-muted-foreground">Votes Cast</span>
                 <span className="font-semibold">N/A</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-muted-foreground">Comments</span>
                 <span className="font-semibold">N/A</span>
               </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">Detailed stats coming soon.</p>
          </div>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card rounded-lg border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">My Activity</h3>
            </div>
            <p className="text-muted-foreground italic">Activity feed coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
