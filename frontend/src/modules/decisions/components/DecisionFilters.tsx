import React from "react";
import { Filter } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DecisionStatus, DecisionVisibility, VoteType } from "../types/decision";

interface DecisionFiltersProps {
  statusFilter: DecisionStatus | "";
  visibilityFilter: DecisionVisibility | "";
  voteTypeFilter: VoteType | "";
  onStatusChange: (val: DecisionStatus | "") => void;
  onVisibilityChange: (val: DecisionVisibility | "") => void;
  onVoteTypeChange: (val: VoteType | "") => void;
}

export function DecisionFilters({
  statusFilter,
  visibilityFilter,
  voteTypeFilter,
  onStatusChange,
  onVisibilityChange,
  onVoteTypeChange,
}: DecisionFiltersProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-blue-500" />
        <h3 className="font-bold text-white">Filters</h3>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-slate-400 mb-3 block">Status</Label>
          <RadioGroup 
            value={statusFilter} 
            onValueChange={(val) => onStatusChange(val as DecisionStatus | "")}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="s-all" className="border-slate-600 text-blue-500" />
              <Label htmlFor="s-all" className="text-slate-300 font-normal">All Statuses</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ACTIVE" id="s-active" className="border-slate-600 text-blue-500" />
              <Label htmlFor="s-active" className="text-slate-300 font-normal">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CLOSED" id="s-closed" className="border-slate-600 text-blue-500" />
              <Label htmlFor="s-closed" className="text-slate-300 font-normal">Closed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="DRAFT" id="s-draft" className="border-slate-600 text-blue-500" />
              <Label htmlFor="s-draft" className="text-slate-300 font-normal">Draft</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-slate-400 mb-3 block">Visibility</Label>
          <RadioGroup 
            value={visibilityFilter} 
            onValueChange={(val) => onVisibilityChange(val as DecisionVisibility | "")}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="v-all" className="border-slate-600 text-blue-500" />
              <Label htmlFor="v-all" className="text-slate-300 font-normal">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PUBLIC" id="v-public" className="border-slate-600 text-blue-500" />
              <Label htmlFor="v-public" className="text-slate-300 font-normal">Public</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PRIVATE" id="v-private" className="border-slate-600 text-blue-500" />
              <Label htmlFor="v-private" className="text-slate-300 font-normal">Private</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-slate-400 mb-3 block">Vote Type</Label>
          <RadioGroup 
            value={voteTypeFilter} 
            onValueChange={(val) => onVoteTypeChange(val as VoteType | "")}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="vt-all" className="border-slate-600 text-blue-500" />
              <Label htmlFor="vt-all" className="text-slate-300 font-normal">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="SINGLE" id="vt-single" className="border-slate-600 text-blue-500" />
              <Label htmlFor="vt-single" className="text-slate-300 font-normal">Single Choice</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="MULTIPLE" id="vt-multiple" className="border-slate-600 text-blue-500" />
              <Label htmlFor="vt-multiple" className="text-slate-300 font-normal">Multiple Choice</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="RATING" id="vt-rating" className="border-slate-600 text-blue-500" />
              <Label htmlFor="vt-rating" className="text-slate-300 font-normal">Rating</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
