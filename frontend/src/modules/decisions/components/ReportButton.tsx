import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
import { ReportDecisionModal } from './ReportDecisionModal';

interface ReportButtonProps {
  decisionId: number;
}

export function ReportButton({ decisionId }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        title="Report Decision"
        className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-400/10"
        onClick={(e) => {
          e.preventDefault(); // Prevent navigating to decision details
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        <Flag className="h-4 w-4" />
        <span className="sr-only">Report</span>
      </Button>

      {isOpen && (
        <ReportDecisionModal
          decisionId={decisionId}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
