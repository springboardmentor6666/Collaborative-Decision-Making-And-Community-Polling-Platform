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
        <Button variant="outline" className="bg-white border-[#CBD5E1] text-[#0F172A] hover:bg-[#EFF6FF] hover:border-slate-400 rounded-[8px]">
          <Filter className="w-4 h-4 mr-2 text-[#2563EB]" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-72 bg-white border-slate-200 p-4 shadow-xl rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <DropdownMenuLabel className="p-0 text-[#0F172A] font-bold">Filter Decisions</DropdownMenuLabel>
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFilters}
              className="h-8 px-2 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <X className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-slate-100 mb-4" />

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        <div>
          <Label className="text-[#64748B] mb-3 block">Status</Label>
          <RadioGroup 
            value={statusFilter} 
            onValueChange={(val) => onStatusChange(val as DecisionStatus | "")}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="s-all" className="border-slate-300 text-[#2563EB]" />
              <Label htmlFor="s-all" className="text-[#0F172A] font-normal">All Statuses</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ACTIVE" id="s-active" className="border-slate-300 text-[#2563EB]" />
              <Label htmlFor="s-active" className="text-[#0F172A] font-normal">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CLOSED" id="s-closed" className="border-slate-300 text-[#2563EB]" />
              <Label htmlFor="s-closed" className="text-[#0F172A] font-normal">Closed</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="DRAFT" id="s-draft" className="border-slate-300 text-[#2563EB]" />
              <Label htmlFor="s-draft" className="text-[#0F172A] font-normal">Draft</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-[#64748B] mb-3 block">Visibility</Label>
          <RadioGroup 
            value={visibilityFilter} 
            onValueChange={(val) => onVisibilityChange(val as DecisionVisibility | "")}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="v-all" className="border-slate-300 text-[#2563EB]" />
              <Label htmlFor="v-all" className="text-[#0F172A] font-normal">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PUBLIC" id="v-public" className="border-slate-300 text-[#2563EB]" />
              <Label htmlFor="v-public" className="text-[#0F172A] font-normal">Public</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PRIVATE" id="v-private" className="border-slate-300 text-[#2563EB]" />
              <Label htmlFor="v-private" className="text-[#0F172A] font-normal">Private</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label className="text-[#64748B] mb-3 block">Vote Type</Label>
          <RadioGroup 
            value={voteTypeFilter} 
            onValueChange={(val) => onVoteTypeChange(val as VoteType | "")}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="vt-all" className="border-slate-300 text-[#2563EB]" />
              <Label htmlFor="vt-all" className="text-[#0F172A] font-normal">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="SINGLE" id="vt-single" className="border-slate-300 text-[#2563EB]" />
              <Label htmlFor="vt-single" className="text-[#0F172A] font-normal">Single Choice</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="MULTIPLE" id="vt-multiple" className="border-slate-300 text-[#2563EB]" />
              <Label htmlFor="vt-multiple" className="text-[#0F172A] font-normal">Multiple Choice</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="RATING" id="vt-rating" className="border-slate-300 text-[#2563EB]" />
              <Label htmlFor="vt-rating" className="text-[#0F172A] font-normal">Rating</Label>
            </div>
          </RadioGroup>
        </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
