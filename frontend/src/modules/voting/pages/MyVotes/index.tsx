import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MyVotes() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 md:p-16 text-center max-w-3xl mx-auto shadow-sm">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckSquare className="w-8 h-8 text-blue-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">My Votes</h1>
        
        <div className="space-y-4 text-slate-400 mb-8">
          <p className="text-lg">
            This feature requires backend support.
          </p>
          <p>
            Currently, the system APIs do not provide an endpoint to fetch all your historical votes. 
            Once the <code className="bg-slate-800 text-blue-400 px-2 py-1 rounded">GET /api/votes/my</code> endpoint is implemented in the Spring Boot backend, this page will display a comprehensive history of every poll you have participated in, your selected options, and the final outcomes.
          </p>
        </div>

        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8">
          <Link to="/decisions">
            Browse Active Decisions
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
