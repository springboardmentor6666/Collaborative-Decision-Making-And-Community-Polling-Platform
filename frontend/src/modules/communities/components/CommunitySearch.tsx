import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CommunitySearchProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
}

export function CommunitySearch({ initialQuery = "", onSearch }: CommunitySearchProps) {
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className="relative w-full md:w-96">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-slate-400" />
      </div>
      <Input
        type="search"
        placeholder="Search communities..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full pl-10 pr-4 py-6 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl focus-visible:ring-blue-500 shadow-none"
      />
    </div>
  );
}
