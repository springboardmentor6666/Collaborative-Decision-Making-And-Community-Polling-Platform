import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DecisionSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function DecisionSearch({ onSearch, placeholder = "Search decisions...", className }: DecisionSearchProps) {
  const [value, setValue] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
