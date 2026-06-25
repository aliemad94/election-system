"use client";

import * as React from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface ModernDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function ModernDatePicker({
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
  className,
}: ModernDatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || "");

  // Update input value when prop changes
  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Try to parse the value to pass to react-day-picker
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    // Regex for YYYY-MM-DD
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (regex.test(val)) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        onChange(val);
      }
    } else if (val === "") {
      onChange("");
    }
  };

  const handleSelectDate = (date: Date | undefined) => {
    if (date) {
      // Format to YYYY-MM-DD local time safely
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - offset * 60 * 1000);
      const formatted = localDate.toISOString().split("T")[0];
      setInputValue(formatted);
      onChange(formatted);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setInputValue("");
    onChange("");
  };

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        className="w-full bg-el-surface border border-el-outline-variant rounded h-8 px-2 pl-14 text-[12px] focus:outline-none focus:border-el-primary font-mono text-right"
      />
      <div className="absolute left-1 flex items-center gap-1">
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-el-surface-container-high rounded text-el-on-surface-variant/60 cursor-pointer flex items-center justify-center"
            title="مسح"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="p-1 hover:bg-el-surface-container-high rounded text-el-primary cursor-pointer flex items-center justify-center"
              title="اختر التاريخ"
            >
              <CalendarIcon className="w-4 h-4 text-el-primary" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto bg-el-surface-container-lowest border border-el-outline-variant shadow-xl rounded-md" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelectDate}
              initialFocus
              captionLayout="dropdown"
              startMonth={new Date(1930, 0)}
              endMonth={new Date(new Date().getFullYear() + 2, 11)}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
