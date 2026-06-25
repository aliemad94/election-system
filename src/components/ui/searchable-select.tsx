'use client';

import * as React from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  value: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  disabled?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "اختر...",
  searchPlaceholder = "بحث...",
  emptyMessage = "لا توجد نتائج",
  className,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const selectedOption = React.useMemo(() => {
    return options.find(opt => String(opt.value) === String(value));
  }, [options, value]);

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(opt =>
      opt.label.toLowerCase().includes(term) ||
      String(opt.value).toLowerCase().includes(term)
    );
  }, [options, searchTerm]);

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-8 w-full items-center justify-between rounded border border-el-outline-variant bg-el-surface px-2 text-[12px] shadow-sm transition-colors focus:outline-hidden focus:border-el-primary disabled:cursor-not-allowed disabled:opacity-50 text-right w-full cursor-pointer",
          !selectedOption && "text-el-on-surface-variant/70"
        )}
        dir="rtl"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50 mr-2" />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 mt-1 max-h-60 w-full overflow-hidden rounded border bg-el-surface text-el-on-surface shadow-lg border-el-outline-variant flex flex-col animate-in fade-in-50 slide-in-from-top-1"
          dir="rtl"
        >
          <div className="flex items-center border-b px-2 border-el-outline-variant/60 bg-transparent shrink-0">
            <Search className="h-3.5 w-3.5 shrink-0 opacity-50 ml-1.5 text-el-on-surface-variant" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex h-8 w-full bg-transparent py-1.5 text-[12px] outline-hidden placeholder:text-el-on-surface-variant/50"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="hover:text-el-on-surface shrink-0 text-el-on-surface-variant cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto max-h-48 p-1 flex-1 scrollbar-thin scrollbar-thumb-el-line scrollbar-track-transparent">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-[11px] text-el-on-surface-variant">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = String(option.value) === String(value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-7 pl-2 text-[11px] outline-hidden transition-colors hover:bg-el-surface-container text-right cursor-pointer text-el-on-surface",
                      isSelected && "font-bold text-el-primary bg-el-primary/5"
                    )}
                  >
                    <span className="absolute right-2 flex h-3 w-3 items-center justify-center">
                      {isSelected && <Check className="h-3.5 w-3.5 text-el-secondary" />}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
