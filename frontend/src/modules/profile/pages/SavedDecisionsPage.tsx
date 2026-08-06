import React from 'react';
import { useSavedDecisions } from '../hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { format } from 'date-fns';
import { AlertCircle, Bookmark } from 'lucide-react';

export function SavedDecisionsPage() {
  const { data, isLoading, error } = useSavedDecisions(0, 50);

  if (isLoading) {
    return <div className="container mx-auto py-8 text-center">Loading saved decisions...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-destructive/15 text-destructive p-4 rounded-md flex gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <h3 className="font-medium">Error</h3>
            <p className="text-sm">Failed to load saved decisions.</p>
          </div>
        </div>
      </div>
    );
  }

  const decisions = data?.content || [];

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Saved Decisions</h1>
        <p className="text-muted-foreground">Decisions you have bookmarked for later.</p>
      </div>

      {decisions.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <Bookmark className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">No saved decisions yet</h3>
            <p className="text-muted-foreground">When you bookmark a decision, it will appear here.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/decisions">Browse Decisions</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {decisions.map((decision) => (
            <Card key={decision.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <Link to={`/decisions/${decision.id}`} className="hover:underline">
                    <h3 className="text-xl font-bold">{decision.title}</h3>
                  </Link>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                    {decision.status}
                  </span>
                </div>
                <p className="text-muted-foreground line-clamp-2 mb-4">{decision.description}</p>
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                  <span>By {decision.createdBy.fullName}</span>
                  <span>•</span>
                  <span>{format(new Date(decision.createdAt), 'MMM d, yyyy')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
