import React from "react";
import { Filter, ChevronDown, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  const activeFiltersCount = 
    (statusFilter ? 1 : 0) + 
    (visibilityFilter ? 1 : 0) + 
    (voteTypeFilter ? 1 : 0);

  const handleClearFilters = () => {
    onStatusChange("");
    onVisibilityChange("");
    onVoteTypeChange("");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-slate-900 border-slate-800 text-white hover:bg-slate-800">
          <Filter className="w-4 h-4 mr-2 text-blue-500" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72 bg-slate-900 border-slate-800 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <DropdownMenuLabel className="p-0 text-white font-bold">Filter Decisions</DropdownMenuLabel>
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFilters}
              className="h-8 px-2 text-xs text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-slate-800 mb-4" />

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
