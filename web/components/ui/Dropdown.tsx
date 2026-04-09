import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Dropdown({ options, value, onChange, className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative" ref={containerRef}>
      <div 
        className={cn("text-[11px] text-gray cursor-pointer flex items-center gap-1 hover:text-dark transition-colors select-none", className)}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption.label} <ChevronDown size={12} />
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-[#e8e8e8] rounded-lg shadow-lg z-50 overflow-hidden py-1">
          {options.map(option => (
            <div
              key={option.value}
              className={cn(
                "px-3 py-2 text-[12px] cursor-pointer transition-colors",
                option.value === value ? "bg-primary/10 text-primary font-medium" : "text-dark hover:bg-gray-50"
              )}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
